import type { CommandKit } from '../../CommandKit';
import {
  AutocompleteInteraction,
  Awaitable,
  Collection,
  CommandInteraction,
  ContextMenuCommandBuilder,
  Events,
  Interaction,
  Locale,
  Message,
  PartialMessage,
  SlashCommandBuilder,
} from 'discord.js';
import { Context } from '../commands/Context';
import { toFileURL } from '../../utils/resolve-file-url';
import { MessageCommandParser } from '../commands/MessageCommandParser';
import { CommandKitErrorCodes, isErrorType } from '../../utils/error-codes';
import { CommandRegistrar } from '../register/CommandRegistrar';
import { GenericFunction } from '../../context/async-context';
import { Logger } from '../../logger/Logger';
import { AsyncFunction } from '../../cache';
import { Command, Middleware } from '../router';
import { AppCommandRunner } from '../commands/AppCommandRunner';
import { COMMANDKIT_IS_DEV } from '../../utils/constants';
import { rewriteCommandDeclaration } from '../../utils/types-package';
import colors from '../../utils/colors';

export type RunCommand = <T extends AsyncFunction>(fn: T) => T;

interface AppCommand {
  command: SlashCommandBuilder | Record<string, any>;
  chatInput?: (ctx: Context) => Awaitable<unknown>;
  autocomplete?: (ctx: Context) => Awaitable<unknown>;
  message?: (ctx: Context) => Awaitable<unknown>;
  messageContextMenu?: (ctx: Context) => Awaitable<unknown>;
  userContextMenu?: (ctx: Context) => Awaitable<unknown>;
}

interface AppCommandMiddleware {
  beforeExecute: (ctx: Context) => Awaitable<unknown>;
  afterExecute: (ctx: Context) => Awaitable<unknown>;
}

export interface LoadedCommand {
  command: Command;
  data: AppCommand;
  guilds?: string[];
}

export type CommandTypeData = string;

export type ResolvableCommand = CommandTypeData | (string & {});

interface LoadedMiddleware {
  middleware: Middleware;
  data: AppCommandMiddleware;
}

export interface PreparedAppCommandExecution {
  command: LoadedCommand;
  middlewares: LoadedMiddleware[];
  messageCommandParser?: MessageCommandParser;
}

export type CommandBuilderLike =
  | SlashCommandBuilder
  | ContextMenuCommandBuilder
  | Record<string, any>;

const commandDataSchema = {
  command: (c: unknown) =>
    c instanceof SlashCommandBuilder ||
    c instanceof ContextMenuCommandBuilder ||
    (c && typeof c === 'object'),
  chatInput: (c: unknown) => typeof c === 'function',
  autocomplete: (c: unknown) => typeof c === 'function',
  message: (c: unknown) => typeof c === 'function',
  messageContextMenu: (c: unknown) => typeof c === 'function',
  userContextMenu: (c: unknown) => typeof c === 'function',
};

const middlewareDataSchema = {
  beforeExecute: (c: unknown) => typeof c === 'function',
  afterExecute: (c: unknown) => typeof c === 'function',
};

export class AppCommandHandler {
  private loadedCommands = new Collection<string, LoadedCommand>();
  private loadedMiddlewares = new Collection<string, LoadedMiddleware>();

  // Name-to-ID mapping for easier lookup
  private commandNameToId = new Map<string, string>();
  private subcommandPathToId = new Map<string, string>();

  public readonly registrar: CommandRegistrar;
  private onInteraction: GenericFunction<[Interaction]> | null = null;
  private onMessageCreate: GenericFunction<[Message]> | null = null;
  private onMessageUpdate: GenericFunction<
    [Message | PartialMessage, Message | PartialMessage]
  > | null = null;
  public readonly commandRunner = new AppCommandRunner(this);

  public readonly externalCommandData = new Collection<string, Command>();
  public readonly externalMiddlewareData = new Collection<string, Middleware>();

  public constructor(public readonly commandkit: CommandKit) {
    this.registrar = new CommandRegistrar(this.commandkit);
  }

  public printBanner() {
    // Group commands by category
    const categorizedCommands = this.getCommandsArray().reduce(
      (acc, cmd) => {
        const category = cmd.command.category || 'uncategorized';
        acc[category] = acc[category] || [];
        acc[category].push(cmd);
        return acc;
      },
      {} as Record<string, LoadedCommand[]>,
    );

    // Get all categories and sort them
    const categories = Object.keys(categorizedCommands).sort();

    console.log(
      colors.green(
        `Loaded ${colors.magenta(this.loadedCommands.size.toString())} commands:`,
      ),
    );

    // Print commands by category
    categories.forEach((category, index) => {
      const commands = categorizedCommands[category];
      const isLastCategory = index === categories.length - 1;
      const categoryPrefix = isLastCategory ? '└─' : '├─';

      // Print category header (skip for uncategorized)
      if (category !== 'uncategorized') {
        console.log(colors.cyan(`${categoryPrefix} ${colors.bold(category)}`));
      }

      // Print commands in this category
      commands.forEach((cmd, cmdIndex) => {
        const isLastCommand = cmdIndex === commands.length - 1;
        const commandPrefix =
          category !== 'uncategorized'
            ? (isLastCategory ? '   ' : '│  ') + (isLastCommand ? '└─' : '├─')
            : isLastCommand
              ? '└─'
              : '├─';

        const name = cmd.data.command.name;
        const hasMw = cmd.command.middlewares.length > 0;
        const middlewareIcon = hasMw ? colors.magenta(' (λ)') : '';

        console.log(
          `${colors.green(commandPrefix)} ${colors.yellow(name)}${middlewareIcon}`,
        );
      });
    });
  }

  public getCommandsArray() {
    return Array.from(this.loadedCommands.values());
  }

  public registerCommandHandler() {
    this.onInteraction ??= async (interaction: Interaction) => {
      const success = await this.commandkit.plugins.execute(
        async (ctx, plugin) => {
          return plugin.onBeforeInteraction(ctx, interaction);
        },
      );

      // plugin will handle the interaction
      if (success) return;

      const isCommandLike =
        interaction.isCommand() ||
        interaction.isAutocomplete() ||
        interaction.isUserContextMenuCommand() ||
        interaction.isMessageContextMenuCommand();

      if (!isCommandLike) return;

      const prepared = await this.prepareCommandRun(interaction);

      if (!prepared) return;

      return this.commandRunner.runCommand(prepared, interaction);
    };

    this.onMessageCreate ??= async (message: Message) => {
      const success = await this.commandkit.plugins.execute(
        async (ctx, plugin) => {
          return plugin.onBeforeMessageCommand(ctx, message);
        },
      );

      // plugin will handle the message
      if (success) return;
      if (message.author.bot) return;

      const prepared = await this.prepareCommandRun(message);

      if (!prepared) return;

      return this.commandRunner.runCommand(prepared, message);
    };

    this.onMessageUpdate ??= async (
      oldMessage: Message | PartialMessage,
      newMessage: Message | PartialMessage,
    ) => {
      const success = await this.commandkit.plugins.execute(
        async (ctx, plugin) => {
          return plugin.onBeforeMessageUpdateCommand(
            ctx,
            oldMessage,
            newMessage,
          );
        },
      );

      // plugin will handle the message
      if (success) return;
      if (oldMessage.partial || newMessage.partial) return;
      if (oldMessage.author.bot) return;

      const prepared = await this.prepareCommandRun(newMessage);

      if (!prepared) return;

      return this.commandRunner.runCommand(prepared, newMessage);
    };

    this.commandkit.client.on(Events.InteractionCreate, this.onInteraction);
    this.commandkit.client.on(Events.MessageCreate, this.onMessageCreate);
    this.commandkit.client.on(Events.MessageUpdate, this.onMessageUpdate);
  }

  public async prepareCommandRun(
    source: Interaction | Message,
    cmdName?: string,
  ): Promise<PreparedAppCommandExecution | null> {
    let parser: MessageCommandParser | undefined;

    // Extract command name (and possibly subcommand) from the source
    if (!cmdName) {
      if (source instanceof Message) {
        if (source.author.bot) return null;

        const prefix =
          await this.commandkit.config.getMessageCommandPrefix(source);

        parser = new MessageCommandParser(
          source,
          Array.isArray(prefix) ? prefix : [prefix],
          (command: string) => {
            // Find the command by name
            const commandId = this.commandNameToId.get(command);
            if (!commandId) return null;

            const loadedCommand = this.loadedCommands.get(commandId);
            if (!loadedCommand) return null;

            if (
              source.guildId &&
              loadedCommand.guilds?.length &&
              !loadedCommand.guilds.includes(source.guildId!)
            ) {
              return null;
            }

            const json =
              'toJSON' in loadedCommand.data.command
                ? loadedCommand.data.command.toJSON()
                : loadedCommand.data.command;

            return (
              json.options?.reduce(
                (acc: Record<string, unknown>, opt: Record<string, any>) => {
                  acc[opt.name] = opt.type;
                  return acc;
                },
                {} as Record<string, unknown>,
              ) ?? {}
            );
          },
        );

        try {
          const fullCommand = parser.getFullCommand();
          const parts = fullCommand.split(' ');
          cmdName = parts[0];
        } catch (e) {
          if (isErrorType(e, CommandKitErrorCodes.InvalidCommandPrefix)) {
            return null;
          }
          Logger.error(e);
          return null;
        }
      } else {
        const isAnyCommand =
          source.isChatInputCommand() ||
          source.isAutocomplete() ||
          source.isContextMenuCommand();

        if (!isAnyCommand) return null;

        cmdName = source.commandName;
      }
    }

    // Find the command by name
    const commandId = this.commandNameToId.get(cmdName);
    if (!commandId) return null;

    const loadedCommand = this.loadedCommands.get(commandId);
    if (!loadedCommand) return null;

    // If this is a guild specific command, check if we're in the right guild
    if (
      (source instanceof CommandInteraction ||
        source instanceof AutocompleteInteraction) &&
      source.guildId &&
      loadedCommand.guilds?.length &&
      !loadedCommand.guilds.includes(source.guildId)
    ) {
      return null;
    }

    // Collect all applicable middleware
    const middlewares: LoadedMiddleware[] = [];

    // Add command-level middleware
    for (const middlewareId of loadedCommand.command.middlewares) {
      const middleware = this.loadedMiddlewares.get(middlewareId);
      if (middleware) {
        middlewares.push(middleware);
      }
    }

    // No middleware for subcommands since they inherit from parent command
    return {
      command: loadedCommand,
      middlewares,
      messageCommandParser: parser,
    };
  }

  public async reloadCommands() {
    this.loadedCommands.clear();
    this.loadedMiddlewares.clear();
    this.commandNameToId.clear();
    this.subcommandPathToId.clear();
    this.externalCommandData.clear();
    this.externalMiddlewareData.clear();

    await this.loadCommands();
  }

  public async addExternalMiddleware(data: Middleware[]) {
    for (const middleware of data) {
      if (!middleware.id) continue;

      this.externalMiddlewareData.set(middleware.id, middleware);
    }
  }

  public async addExternalCommands(data: Command[]) {
    for (const command of data) {
      if (!command.id) continue;

      this.externalCommandData.set(command.id, command);
    }
  }

  public async registerExternalLoadedMiddleware(data: LoadedMiddleware[]) {
    for (const middleware of data) {
      this.loadedMiddlewares.set(middleware.middleware.id, middleware);
    }
  }

  public async registerExternalLoadedCommands(data: LoadedCommand[]) {
    for (const command of data) {
      this.loadedCommands.set(command.command.id, command);
      this.commandNameToId.set(command.command.name, command.command.id);
    }
  }

  public async loadCommands() {
    await this.commandkit.plugins.execute((ctx, plugin) => {
      return plugin.onBeforeCommandsLoad(ctx);
    });

    const commandsRouter = this.commandkit.commandsRouter;

    if (!commandsRouter) {
      throw new Error('Commands router has not yet initialized');
    }

    const { commands, middlewares } = commandsRouter.getData();

    const combinedCommands = this.externalCommandData.size
      ? commands.concat(this.externalCommandData)
      : commands;

    const combinedMiddlewares = this.externalMiddlewareData.size
      ? middlewares.concat(this.externalMiddlewareData)
      : middlewares;

    // Load middlewares first
    for (const [id, middleware] of combinedMiddlewares) {
      await this.loadMiddleware(id, middleware);
    }

    // Load commands
    for (const [id, command] of combinedCommands) {
      await this.loadCommand(id, command);
    }

    // generate types
    if (COMMANDKIT_IS_DEV) {
      await rewriteCommandDeclaration(
        `type CommandTypeData = ${Array.from(
          this.loadedCommands
            .mapValues((v) => JSON.stringify(v.command.name))
            .values(),
        ).join(' | ')}`,
      );
    }

    await this.commandkit.plugins.execute((ctx, plugin) => {
      return plugin.onAfterCommandsLoad(ctx);
    });
  }

  private async loadMiddleware(id: string, middleware: Middleware) {
    try {
      const data = await import(
        `${toFileURL(middleware.path)}?t=${Date.now()}`
      );

      let handlerCount = 0;
      for (const [key, validator] of Object.entries(middlewareDataSchema)) {
        if (data[key] && !(await validator(data[key]))) {
          throw new Error(
            `Invalid export for middleware ${id}: ${key} does not match expected value`,
          );
        }

        if (data[key]) handlerCount++;
      }

      if (handlerCount === 0) {
        throw new Error(
          `Invalid export for middleware ${id}: at least one handler function must be provided`,
        );
      }

      this.loadedMiddlewares.set(id, { middleware, data });
    } catch (error) {
      Logger.error(`Failed to load middleware ${id}`, error);
    }
  }

  private async loadCommand(id: string, command: Command) {
    try {
      // Skip if path is null (directory-only command group)
      if (command.path === null) {
        this.loadedCommands.set(id, {
          command,
          data: {
            command: {
              name: command.name,
              description: `${command.name} commands`,
              type: 1,
            },
          },
        });
        return;
      }

      const data = await import(`${toFileURL(command.path)}?t=${Date.now()}`);

      if (!data.command) {
        throw new Error(
          `Invalid export for command ${command.name}: no command definition found`,
        );
      }

      let handlerCount = 0;
      for (const [key, validator] of Object.entries(commandDataSchema)) {
        if (key !== 'command' && data[key]) handlerCount++;
        if (data[key] && !(await validator(data[key]))) {
          throw new Error(
            `Invalid export for command ${command.name}: ${key} does not match expected value`,
          );
        }
      }

      if (handlerCount === 0) {
        throw new Error(
          `Invalid export for command ${command.name}: at least one handler function must be provided`,
        );
      }

      let lastUpdated = data.command;

      await this.commandkit.plugins.execute(async (ctx, plugin) => {
        const res = await plugin.prepareCommand(ctx, lastUpdated);

        if (res) {
          lastUpdated = res;
        }
      });

      this.loadedCommands.set(id, {
        command,
        guilds: data.guilds,
        data: {
          ...data,
          command: 'toJSON' in lastUpdated ? lastUpdated.toJSON() : lastUpdated,
        },
      });

      // Map command name to ID for easier lookup
      this.commandNameToId.set(command.name, id);
    } catch (error) {
      Logger.error(`Failed to load command ${command.name} (${id})`, error);
    }
  }
}
