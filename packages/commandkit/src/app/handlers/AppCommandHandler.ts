import {
  ApplicationCommandType,
  AutocompleteInteraction,
  Awaitable,
  Collection,
  CommandInteraction,
  ContextMenuCommandBuilder,
  Events,
  Interaction,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import type { CommandKit } from '../../CommandKit';
import { AsyncFunction, GenericFunction } from '../../context/async-context';
import { Logger } from '../../logger/Logger';
import type { CommandData } from '../../types';
import colors from '../../utils/colors';
import { COMMANDKIT_IS_DEV } from '../../utils/constants';
import { CommandKitErrorCodes, isErrorType } from '../../utils/error-codes';
import { toFileURL } from '../../utils/resolve-file-url';
import { rewriteCommandDeclaration } from '../../utils/types-package';
import { AppCommandRunner } from '../commands/AppCommandRunner';
import { Context } from '../commands/Context';
import { MessageCommandParser } from '../commands/MessageCommandParser';
import { CommandRegistrar } from '../register/CommandRegistrar';
import { Command, Middleware } from '../router';
import { getConfig } from '../../config/config';

/**
 * Function type for wrapping command execution with custom logic.
 */
export type RunCommand = <T extends AsyncFunction>(fn: T) => T;

/**
 * Represents a native command structure used in CommandKit.
 * This structure includes the command definition and various handlers for different interaction types.
 * It can be used to define slash commands, context menu commands, and message commands.
 */
export interface AppCommandNative {
  command: CommandData | Record<string, any>;
  chatInput?: (ctx: Context) => Awaitable<unknown>;
  autocomplete?: (ctx: Context) => Awaitable<unknown>;
  message?: (ctx: Context) => Awaitable<unknown>;
  messageContextMenu?: (ctx: Context) => Awaitable<unknown>;
  userContextMenu?: (ctx: Context) => Awaitable<unknown>;
}

/**
 * Custom properties that can be added to an AppCommand.
 * This allows for additional metadata or configuration to be associated with a command.
 */
// export type CustomAppCommandProps = Record<string, any>;
export interface CustomAppCommandProps {
  [key: string]: any;
}

/**
 * Represents a command in the CommandKit application, including its metadata and handlers.
 * This type extends the native command structure with additional properties.
 */
export type AppCommand = AppCommandNative & CustomAppCommandProps;

/**
 * @private
 * @internal
 */
interface AppCommandMiddleware {
  beforeExecute: (ctx: Context) => Awaitable<unknown>;
  afterExecute: (ctx: Context) => Awaitable<unknown>;
}

/**
 * Represents a loaded command with its metadata and configuration.
 */
export interface LoadedCommand {
  command: Command;
  data: AppCommand;
  guilds?: string[];
}

/**
 * Type representing command data identifier.
 */
export type CommandTypeData = string;

/**
 * Type for commands that can be resolved by the handler.
 */
export type ResolvableCommand = CommandTypeData | (string & {});

/**
 * @private
 * @internal
 */
interface LoadedMiddleware {
  middleware: Middleware;
  data: AppCommandMiddleware;
}

/**
 * Represents a prepared command execution with all necessary data and middleware.
 */
export interface PreparedAppCommandExecution {
  command: LoadedCommand;
  middlewares: LoadedMiddleware[];
  messageCommandParser?: MessageCommandParser;
}

/**
 * Type representing command builder objects supported by CommandKit.
 */
export type CommandBuilderLike =
  | SlashCommandBuilder
  | ContextMenuCommandBuilder
  | Record<string, any>;

/**
 * @private
 * @internal
 */
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

export type CommandDataSchema = typeof commandDataSchema;
export type CommandDataSchemaKey = keyof CommandDataSchema;
export type CommandDataSchemaValue = CommandDataSchema[CommandDataSchemaKey];

/**
 * @private
 * @internal
 */
const middlewareDataSchema = {
  beforeExecute: (c: unknown) => typeof c === 'function',
  afterExecute: (c: unknown) => typeof c === 'function',
};

/**
 * Handles application commands for CommandKit, including loading, registration, and execution.
 * Manages both slash commands and message commands with middleware support.
 */
export class AppCommandHandler {
  /**
   * @private
   * @internal
   */
  private loadedCommands = new Collection<string, LoadedCommand>();

  /**
   * @private
   * @internal
   */
  private loadedMiddlewares = new Collection<string, LoadedMiddleware>();

  // Name-to-ID mapping for easier lookup
  /**
   * @private
   * @internal
   */
  private commandNameToId = new Map<string, string>();

  /**
   * @private
   * @internal
   */
  private subcommandPathToId = new Map<string, string>();

  /**
   * Command registrar for handling Discord API registration.
   */
  public readonly registrar: CommandRegistrar;

  /**
   * @private
   * @internal
   */
  private onInteraction: GenericFunction<[Interaction]> | null = null;

  /**
   * @private
   * @internal
   */
  private onMessageCreate: GenericFunction<[Message]> | null = null;

  /**
   * Command runner instance for executing commands.
   */
  public readonly commandRunner = new AppCommandRunner(this);

  /**
   * External command data storage.
   */
  public readonly externalCommandData = new Collection<string, Command>();

  /**
   * External middleware data storage.
   */
  public readonly externalMiddlewareData = new Collection<string, Middleware>();

  /**
   * Creates a new AppCommandHandler instance.
   * @param commandkit - The CommandKit instance
   */
  public constructor(public readonly commandkit: CommandKit) {
    this.registrar = new CommandRegistrar(this.commandkit);
  }

  /**
   * Prints a formatted banner showing all loaded commands organized by category.
   */
  public printBanner() {
    const uncategorized = crypto.randomUUID();

    // Group commands by category
    const categorizedCommands = this.getCommandsArray().reduce(
      (acc, cmd) => {
        const category = cmd.command.category || uncategorized;
        acc[category] = acc[category] || [];
        acc[category].push(cmd);
        return acc;
      },
      {} as Record<string, LoadedCommand[]>,
    );

    console.log(
      colors.green(
        `Loaded ${colors.magenta(this.loadedCommands.size.toString())} commands:`,
      ),
    );

    const categories = Object.keys(categorizedCommands).sort();

    // Build category tree for all nesting depths
    const categoryTree: Record<string, string[]> = {};

    // Find the best parent for nested categories
    categories.forEach((category) => {
      if (category === uncategorized) return;

      if (category.includes(':')) {
        const parts = category.split(':');
        let bestParent = null;

        // Try to find the deepest existing parent
        for (let i = parts.length - 1; i > 0; i--) {
          const potentialParent = parts.slice(0, i).join(':');
          if (categories.includes(potentialParent)) {
            bestParent = potentialParent;
            break;
          }
        }

        // If we found a parent, add this category as its child
        if (bestParent) {
          categoryTree[bestParent] = categoryTree[bestParent] || [];
          categoryTree[bestParent].push(category);
        }
      }
    });

    // Track categories we've processed to avoid duplicates
    const processedCategories = new Set<string>();

    // Recursive function to print a category and its children
    const printCategory = (
      category: string,
      indent: string = '',
      isLast: boolean = false,
      parentPrefix: string = '',
    ) => {
      // Skip if already processed
      if (processedCategories.has(category)) return;
      processedCategories.add(category);

      const commands = categorizedCommands[category];
      const hasChildren =
        categoryTree[category] && categoryTree[category].length > 0;
      const thisPrefix = isLast ? '└─' : '├─';
      const childIndent = parentPrefix + (isLast ? '   ' : '│  ');

      // Print category name if not uncategorized
      if (category !== uncategorized) {
        // For nested categories, only print the last part after the colon
        const displayName = category.includes(':')
          ? category.split(':').pop()
          : category;

        console.log(
          colors.cyan(`${indent}${thisPrefix} ${colors.bold(displayName!)}`),
        );
      }

      // Print commands in this category
      commands.forEach((cmd, cmdIndex) => {
        const cmdIsLast = cmdIndex === commands.length - 1 && !hasChildren;
        const cmdPrefix = cmdIsLast ? '└─' : '├─';
        const cmdIndent = category !== uncategorized ? childIndent : indent;

        const name = cmd.data.command.name;
        const hasMw = cmd.command.middlewares.length > 0;
        const middlewareIcon = hasMw ? colors.magenta(' (λ)') : '';

        console.log(
          `${colors.green(`${cmdIndent}${cmdPrefix}`)} ${colors.yellow(name)}${middlewareIcon}`,
        );
      });

      // Process nested categories
      if (hasChildren) {
        const children = categoryTree[category].sort();
        children.forEach((childCategory, idx) => {
          const childIsLast = idx === children.length - 1;
          printCategory(childCategory, childIndent, childIsLast, childIndent);
        });
      }
    };

    // Find and print top-level categories
    const topLevelCategories = categories
      .filter((category) => {
        if (category === uncategorized) return true;

        if (category.includes(':')) {
          const parts = category.split(':');
          // Check if any parent path exists as a category
          for (let i = 1; i < parts.length; i++) {
            const parentPath = parts.slice(0, i).join(':');
            if (categories.includes(parentPath)) {
              return false; // Not top-level, it has a parent
            }
          }
          return true; // No parent found, so it's top-level
        }

        return true; // Not nested, so it's top-level
      })
      .sort();

    // Print each top-level category
    topLevelCategories.forEach((category, index) => {
      const isLast = index === topLevelCategories.length - 1;
      printCategory(category, '', isLast);
    });
  }

  /**
   * Gets an array of all loaded commands.
   * @returns Array of loaded commands
   */
  public getCommandsArray() {
    return Array.from(this.loadedCommands.values());
  }

  /**
   * Registers event handlers for Discord interactions and messages.
   */
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

    this.commandkit.client.on(Events.InteractionCreate, this.onInteraction);
    this.commandkit.client.on(Events.MessageCreate, this.onMessageCreate);
  }

  /**
   * Prepares a command for execution by resolving the command and its middleware.
   * @param source - The interaction or message that triggered the command
   * @param cmdName - Optional command name override
   * @returns Prepared command execution data or null if command not found
   */
  public async prepareCommandRun(
    source: Interaction | Message,
    cmdName?: string,
  ): Promise<PreparedAppCommandExecution | null> {
    const config = getConfig();

    if (config.disablePrefixCommands && source instanceof Message) {
      return null;
    }

    let parser: MessageCommandParser | undefined;

    // Extract command name (and possibly subcommand) from the source
    if (!cmdName) {
      if (source instanceof Message) {
        if (source.author.bot) return null;

        const prefix =
          await this.commandkit.config.getMessageCommandPrefix(source);

        if (!prefix || !prefix.length) return null;

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

  /**
   * Reloads all commands and middleware from scratch.
   */
  public async reloadCommands() {
    this.loadedCommands.clear();
    this.loadedMiddlewares.clear();
    this.commandNameToId.clear();
    this.subcommandPathToId.clear();
    this.externalCommandData.clear();
    this.externalMiddlewareData.clear();

    await this.loadCommands();
  }

  /**
   * Adds external middleware data to be loaded.
   * @param data - Array of middleware data to add
   */
  public async addExternalMiddleware(data: Middleware[]) {
    for (const middleware of data) {
      if (!middleware.id) continue;

      this.externalMiddlewareData.set(middleware.id, middleware);
    }
  }

  /**
   * Adds external command data to be loaded.
   * @param data - Array of command data to add
   */
  public async addExternalCommands(data: Command[]) {
    for (const command of data) {
      if (!command.id) continue;

      this.externalCommandData.set(command.id, command);
    }
  }

  /**
   * Registers externally loaded middleware.
   * @param data - Array of loaded middleware to register
   */
  public async registerExternalLoadedMiddleware(data: LoadedMiddleware[]) {
    for (const middleware of data) {
      this.loadedMiddlewares.set(middleware.middleware.id, middleware);
    }
  }

  /**
   * Registers externally loaded commands.
   * @param data - Array of loaded commands to register
   */
  public async registerExternalLoadedCommands(data: LoadedCommand[]) {
    for (const command of data) {
      this.loadedCommands.set(command.command.id, command);
      this.commandNameToId.set(command.command.name, command.command.id);
    }
  }

  /**
   * Loads all commands and middleware from the router.
   */
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

  /**
   * @private
   * @internal
   */
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

  /**
   * @private
   * @internal
   */
  private async loadCommand(id: string, command: Command) {
    try {
      // Skip if path is null (directory-only command group)
      if (command.path === null) {
        this.loadedCommands.set(id, {
          command,
          data: {
            command: {
              name: command.name,
              description: `${command.name} command`,
              type: 1,
            },
          },
        });
        return;
      }

      const commandFileData = (await import(
        `${toFileURL(command.path)}?t=${Date.now()}`
      )) as AppCommandNative;

      if (!commandFileData.command) {
        throw new Error(
          `Invalid export for command ${command.name}: no command definition found`,
        );
      }

      if (
        (!commandFileData.command.type ||
          commandFileData.command.type === ApplicationCommandType.ChatInput) &&
        !commandFileData.command.description
      ) {
        commandFileData.command.description = `${command.name} command`;
      }

      let handlerCount = 0;

      for (const [key, propValidator] of Object.entries(commandDataSchema) as [
        CommandDataSchemaKey,
        CommandDataSchemaValue,
      ][]) {
        const exportedProp = commandFileData[key];

        if (exportedProp) {
          if (!(await propValidator(exportedProp))) {
            throw new Error(
              `Invalid export for command ${command.name}: ${key} does not match expected value`,
            );
          }

          if (key !== 'command') {
            // command file includes a handler function (chatInput, message, etc)
            handlerCount++;
          }
        }
      }

      if (handlerCount === 0) {
        throw new Error(
          `Invalid export for command ${command.name}: at least one handler function must be provided`,
        );
      }

      let lastUpdated = commandFileData.command;

      await this.commandkit.plugins.execute(async (ctx, plugin) => {
        const res = await plugin.prepareCommand(ctx, lastUpdated);

        if (res) {
          lastUpdated = res;
        }
      });

      this.loadedCommands.set(id, {
        command,
        guilds: commandFileData.command.guilds,
        data: {
          ...commandFileData,
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
