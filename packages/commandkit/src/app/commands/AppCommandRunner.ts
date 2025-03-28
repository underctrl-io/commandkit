import { ChatInputCommandInteraction, Interaction, Message } from 'discord.js';
import {
  afterCommand,
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
  useEnvironment,
} from '../../context/async-context';

export class AppCommandRunner {
  public constructor(private handler: AppCommandHandler) {}

  public async runCommand(
    prepared: PreparedAppCommandExecution,
    source: Interaction | Message,
  ) {
    if (
      source instanceof Message &&
      (source.editedTimestamp || source.partial)
    ) {
      // TODO: handle message edit
      return;
    }

    const { commandkit } = this.handler;

    const executionMode = this.getExecutionMode(source);

    let runCommand: RunCommand | null = null;

    const env = new CommandKitEnvironment(commandkit);
    env.setType(CommandKitEnvironmentType.CommandHandler);
    env.variables.set('commandHandlerType', 'app');
    env.variables.set('currentCommandName', prepared.command.command.name);
    env.variables.set('execHandlerKind', executionMode);

    const ctx = new MiddlewareContext(commandkit, {
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

    // Run middleware before command execution
    for (const middleware of prepared.middlewares) {
      await middleware.data.beforeExecute(ctx);
    }

    // Determine which function to run based on whether we're executing a command or subcommand
    const targetData = prepared.command.data;
    const fn = targetData[executionMode];

    if (!fn) {
      Logger.warn(
        `Command ${prepared.command.command.name} has no handler for ${executionMode}`,
      );
    }

    if (fn) {
      try {
        const _executeCommand = makeContextAwareFunction(
          env,
          async () => {
            afterCommand((env) => {
              const error = env.getExecutionError();
              const marker = env.getMarker();
              const time = `${env.getExecutionTime().toFixed(2)}ms`;

              if (error) {
                Logger.error(
                  `[${marker} - ${time}] Error executing command: ${error.stack || error}`,
                );

                return;
              }

              Logger.info(
                `[${marker} - ${time}] Command executed successfully`,
              );
            });

            return fn(ctx.clone());
          },
          this.#finalizer.bind(this),
        );

        const executeCommand =
          runCommand != null
            ? (runCommand as RunCommand)(_executeCommand)
            : _executeCommand;

        env.markStart(prepared.command.command.name);

        const res = await commandkit.plugins.execute(async (ctx, plugin) => {
          return plugin.executeCommand(ctx, source, prepared, executeCommand);
        });

        if (!res) {
          await executeCommand();
        }
      } catch (e) {
        Logger.error(e);
      }
    }

    try {
      // Run middleware after command execution
      for (const middleware of prepared.middlewares) {
        await middleware.data.afterExecute(ctx);
      }
    } finally {
      env.markEnd();
    }
  }

  async #finalizer() {
    const env = useEnvironment();

    await env.runDeferredFunctions();

    env.clearAllDeferredFunctions();
  }

  public getExecutionMode(source: Interaction | Message): CommandExecutionMode {
    if (source instanceof Message) return CommandExecutionMode.Message;
    if (source.isChatInputCommand()) return CommandExecutionMode.SlashCommand;
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
