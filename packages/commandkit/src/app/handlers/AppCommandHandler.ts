import type { CommandKit } from '../../CommandKit';
import {
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
import { Context } from '../commands/Context';
import { toFileURL } from '../../utils/resolve-file-url';
import { MessageCommandParser } from '../commands/MessageCommandParser';
import { CommandKitErrorCodes, isErrorType } from '../../utils/error-codes';
import { CommandRegistrar } from '../register/CommandRegistrar';
import { AsyncFunction, GenericFunction } from '../../context/async-context';
import { Logger } from '../../logger/Logger';
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
  public readonly commandRunner = new AppCommandRunner(this);

  public readonly externalCommandData = new Collection<string, Command>();
  public readonly externalMiddlewareData = new Collection<string, Middleware>();

  public constructor(public readonly commandkit: CommandKit) {
    this.registrar = new CommandRegistrar(this.commandkit);
  }

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

    this.commandkit.client.on(Events.InteractionCreate, this.onInteraction);
    this.commandkit.client.on(Events.MessageCreate, this.onMessageCreate);
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
