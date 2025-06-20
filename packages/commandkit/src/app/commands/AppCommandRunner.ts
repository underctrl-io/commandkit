import { ChatInputCommandInteraction, Interaction, Message } from 'discord.js';
import {
  CommandKitEnvironment,
  CommandKitEnvironmentType,
} from '../../context/environment';
import { Logger } from '../../logger/Logger';
import {
  AppCommandHandler,
  PreparedAppCommandExecution,
  RunCommand,
} from '../handlers/AppCommandHandler';
import { CommandExecutionMode, MiddlewareContext } from './Context';
import {
  makeContextAwareFunction,
  provideContext,
  useEnvironment,
} from '../../context/async-context';
import { CommandKitErrorCodes, isErrorType } from '../../utils/error-codes';
import { AnalyticsEvents } from '../../analytics/constants';

/**
 * Options for running a command in CommandKit.
 */
export interface RunCommandOptions {
  /**
   * The handler to use for executing the command.
   * If not provided, the execution mode will determine the handler.
   * For example, 'chatInputCommand', 'message', etc.
   */
  handler?: string;
  /**
   * Whether to throw an error if the command execution fails.
   * If true, any error during execution will be thrown.
   * Default is false, which means errors will be logged but not thrown.
   * @default false
   */
  throwOnError?: boolean;
}

/**
 * Handles the execution of application commands for CommandKit.
 * Manages middleware execution, environment setup, and command invocation.
 */
export class AppCommandRunner {
  /**
   * Creates a new AppCommandRunner instance.
   * @param handler - The app command handler instance to use for command execution
   */
  public constructor(private handler: AppCommandHandler) {}

  /**
   * Executes a prepared command with middleware support and environment setup.
   * Handles the complete command lifecycle including before/after middleware execution.
   * @param prepared - The prepared command execution data
   * @param source - The source interaction or message that triggered the command
   */
  public async runCommand(
    prepared: PreparedAppCommandExecution,
    source: Interaction | Message,
    options?: RunCommandOptions,
  ) {
    const { commandkit } = this.handler;

    const shouldThrowOnError = !!options?.throwOnError;

    const executionMode = this.getExecutionMode(source);

    let runCommand: RunCommand | null = null;

    const env = new CommandKitEnvironment(commandkit);
    env.setType(CommandKitEnvironmentType.CommandHandler);
    env.variables.set('commandHandlerType', 'app');
    env.variables.set('currentCommandName', prepared.command.command.name);
    env.variables.set('execHandlerKind', executionMode);
    env.variables.set('customHandler', options?.handler ?? null);

    const ctx = new MiddlewareContext(commandkit, {
      command: prepared.command,
      environment: env,
      executionMode,
      interaction: !(source instanceof Message)
        ? (source as ChatInputCommandInteraction)
        : (null as never),
      message: source instanceof Message ? source : (null as never),
      forwarded: false,
      customArgs: {
        setCommandRunner: (fn: RunCommand) => {
          runCommand = fn;
        },
      },
      messageCommandParser: prepared.messageCommandParser,
    });

    let middlewaresCanceled = false;

    // Run middleware before command execution
    if (prepared.middlewares.length) {
      await provideContext(env, async () => {
        for (const middleware of prepared.middlewares) {
          if (!middleware.data.beforeExecute) continue;
          try {
            await middleware.data.beforeExecute(ctx);
          } catch (e) {
            if (isErrorType(e, CommandKitErrorCodes.ExitMiddleware)) {
              middlewaresCanceled = true;
              return;
            }

            if (
              isErrorType(e, [
                CommandKitErrorCodes.ForwardedCommand,
                CommandKitErrorCodes.InvalidCommandPrefix,
              ])
            ) {
              continue;
            }

            throw e;
          }
        }
      });
    }

    let result: any;

    if (!ctx.cancelled) {
      // Determine which function to run based on whether we're executing a command or subcommand
      const targetData = prepared.command.data;
      const fn = targetData[options?.handler || executionMode];

      if (!fn) {
        Logger.warn(
          `Command ${prepared.command.command.name} has no handler for ${executionMode}`,
        );
      }

      const analytics = commandkit.analytics;

      if (fn) {
        try {
          const _executeCommand = makeContextAwareFunction(
            env,
            async () => {
              env.registerDeferredFunction(async (env) => {
                env.markEnd();
                const error = env.getExecutionError();
                const marker = env.getMarker();
                const time = `${env.getExecutionTime().toFixed(2)}ms`;

                if (error) {
                  Logger.error(
                    `[${marker} - ${time}] Error executing command: ${error.stack || error}`,
                  );

                  const commandName =
                    prepared.command?.data?.command?.name ??
                    prepared.command.command.name;

                  await analytics.track({
                    name: AnalyticsEvents.COMMAND_EXECUTION,
                    id: commandName,
                    data: {
                      error: true,
                      executionTime: env.getExecutionTime().toFixed(2),
                      type: executionMode,
                      command: commandName,
                    },
                  });

                  return;
                }

                Logger.info(
                  `[${marker} - ${time}] Command executed successfully`,
                );

                const commandName =
                  prepared.command?.data?.command?.name ??
                  prepared.command.command.name;

                await analytics.track({
                  name: AnalyticsEvents.COMMAND_EXECUTION,
                  id: commandName,
                  data: {
                    error: false,
                    executionTime: env.getExecutionTime().toFixed(2),
                    type: executionMode,
                    command: commandName,
                  },
                });
              });

              return fn(ctx.clone());
            },
            this.#finalizer.bind(this),
          );

          const executeCommand =
            runCommand != null
              ? (runCommand as RunCommand)(_executeCommand)
              : _executeCommand;

          env.markStart(prepared.command.data.command.name);

          const res = await commandkit.plugins.execute(async (ctx, plugin) => {
            return plugin.executeCommand(
              ctx,
              env,
              source,
              prepared,
              executeCommand,
            );
          });

          if (!res) {
            result = await executeCommand();
          }
        } catch (e) {
          if (isErrorType(e, CommandKitErrorCodes.ExitMiddleware)) {
            middlewaresCanceled = true;
          }

          if (
            !isErrorType(e, [
              CommandKitErrorCodes.ForwardedCommand,
              CommandKitErrorCodes.ExitMiddleware,
            ])
          ) {
            if (shouldThrowOnError) {
              throw e;
            }

            Logger.error(e);
          }
        }
      }
    } else {
      result = {
        error: true,
        message: 'Command execution was cancelled by the middleware.',
      };
    }

    // Run middleware after command execution
    if (!middlewaresCanceled && prepared.middlewares.length) {
      await provideContext(env, async () => {
        for (const middleware of prepared.middlewares) {
          if (!middleware.data.afterExecute) continue;
          try {
            await middleware.data.afterExecute(ctx);
          } catch (e) {
            if (isErrorType(e, CommandKitErrorCodes.ExitMiddleware)) {
              return;
            }

            throw e;
          }
        }
      });
    }

    return result;
  }

  /**
   * @private
   * @internal
   * Finalizes command execution by running deferred functions and plugin cleanup.
   */
  async #finalizer() {
    const env = useEnvironment();

    await env.runDeferredFunctions();

    env.clearAllDeferredFunctions();

    // plugins may have their own deferred function, useful for cleanup or post-command analytics
    await this.handler.commandkit.plugins.execute(async (ctx, plugin) => {
      await plugin.onAfterCommand(ctx, env);
    });
  }

  /**
   * Determines the execution mode based on the source of the command.
   * @param source - The interaction or message that triggered the command
   * @returns The appropriate command execution mode
   */
  public getExecutionMode(source: Interaction | Message): CommandExecutionMode {
    if (source instanceof Message) return CommandExecutionMode.Message;
    if (source.isChatInputCommand())
      return CommandExecutionMode.ChatInputCommand;
    if (source.isAutocomplete()) {
      return CommandExecutionMode.Autocomplete;
    }
    if (source.isMessageContextMenuCommand()) {
      return CommandExecutionMode.MessageContextMenu;
    }
    if (source.isUserContextMenuCommand()) {
      return CommandExecutionMode.UserContextMenu;
    }

    return null as never;
  }
}
