import type { CommandKit } from '../../CommandKit';
import {
  Awaitable,
  ChatInputCommandInteraction,
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
import {
  CommandExecutionMode,
  Context,
  MiddlewareContext,
} from '../commands/Context';
import { toFileURL } from '../../utils/resolve-file-url';
import {
  ApiTranslatableCommandOptions,
  TranslatableCommandOptions,
} from '../i18n/Translation';
import { MessageCommandParser } from '../commands/MessageCommandParser';
import { CommandKitErrorCodes, isErrorType } from '../../utils/error-codes';
import { ParsedCommand, ParsedMiddleware, ParsedSubCommand } from '../router';
import { CommandRegistrar } from '../register/CommandRegistrar';
import { GenericFunction } from '../../context/async-context';
import { Logger } from '../../logger/Logger';
import { AsyncFunction } from '../../cache';

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
  command: ParsedCommand;
  data: AppCommand;
  subcommands?: ParsedSubCommand[];
  guilds?: string[];
}

interface LoadedMiddleware {
  middleware: ParsedMiddleware;
  data: AppCommandMiddleware;
}

export interface PreparedAppCommandExecution {
  command: LoadedCommand;
  subcommand?: LoadedSubCommand | null;
  middlewares: LoadedMiddleware[];
  messageCommandParser?: MessageCommandParser;
}

interface LoadedSubCommand {
  subcommand: ParsedSubCommand;
  data: AppCommand;
}

type CommandBuilderLike =
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
  private loadedSubCommands = new Collection<string, LoadedSubCommand>();
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

  public constructor(public readonly commandkit: CommandKit) {
    this.registrar = new CommandRegistrar(this.commandkit);
  }

  public getCommandsArray() {
    return Array.from(this.loadedCommands.values());
  }

  /**
   * Get subcommand data by command ID and subcommand name
   */
  public getSubcommandData(commandId: string, subcommandName: string) {
    const subcommand = Array.from(this.loadedSubCommands.values()).find(
      (sub) =>
        sub.subcommand.command === commandId &&
        sub.subcommand.name === subcommandName,
    );
    if (!subcommand) return null;

    const commandData = subcommand.data.command;
    return 'toJSON' in commandData ? commandData.toJSON() : commandData;
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

      return this.runCommand(prepared, interaction);
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

      return this.runCommand(prepared, message);
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

      return this.runCommand(prepared, newMessage);
    };

    this.commandkit.client.on(Events.InteractionCreate, this.onInteraction);
    this.commandkit.client.on(Events.MessageCreate, this.onMessageCreate);
    this.commandkit.client.on(Events.MessageUpdate, this.onMessageUpdate);
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

    const executionMode = this.getExecutionMode(source);

    let runCommand: RunCommand | null = null;

    const ctx = new MiddlewareContext(this.commandkit, {
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
    });

    // Run middleware before command execution
    for (const middleware of prepared.middlewares) {
      await middleware.data.beforeExecute(ctx);
    }

    // Determine which function to run based on whether we're executing a command or subcommand
    const targetData = prepared.subcommand
      ? prepared.subcommand.data
      : prepared.command.data;
    const fn = targetData[executionMode];

    if (!fn) {
      Logger.warn(
        `Command ${prepared.command.command.name}${prepared.subcommand ? '/' + prepared.subcommand.subcommand.name : ''} has no handler for ${executionMode}`,
      );
    }

    if (fn) {
      try {
        const _executeCommand = async () => fn(ctx.clone());
        const executeCommand =
          runCommand != null
            ? (runCommand as RunCommand)(_executeCommand)
            : _executeCommand;
        const res = await this.commandkit.plugins.execute(
          async (ctx, plugin) => {
            return plugin.executeCommand(ctx, source, prepared, executeCommand);
          },
        );

        if (!res) {
          await executeCommand();
        }
      } catch (e) {
        Logger.error(e);
      }
    }

    // Run middleware after command execution
    for (const middleware of prepared.middlewares) {
      await middleware.data.afterExecute(ctx);
    }
  }

  public async prepareCommandRun(
    source: Interaction | Message,
  ): Promise<PreparedAppCommandExecution | null> {
    let cmdName: string;
    let subcommandGroupName: string | null = null;
    let subcommandName: string | null = null;
    let parser: MessageCommandParser | undefined;

    // Extract command name (and possibly subcommand) from the source
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

        // Check if this is a subcommand (with format: "command subcommand" or "command group subcommand")
        if (parts.length > 1) {
          if (parts.length === 3) {
            // Format: "command group subcommand"
            subcommandGroupName = parts[1];
            subcommandName = parts[2];
          } else {
            // Format: "command subcommand"
            subcommandName = parts[1];
          }
        }
      } catch (e) {
        if (isErrorType(e, CommandKitErrorCodes.InvalidCommandPrefix)) {
          return null;
        }
        console.error(e);
        return null;
      }
    } else {
      if (!source.isCommand()) return null;

      cmdName = source.commandName;

      if (source.isChatInputCommand()) {
        subcommandGroupName = source.options.getSubcommandGroup(false);
        subcommandName = source.options.getSubcommand(false);
      }
    }

    // Find the command by name
    const commandId = this.commandNameToId.get(cmdName);
    if (!commandId) return null;

    const loadedCommand = this.loadedCommands.get(commandId);
    if (!loadedCommand) return null;

    // If this is a guild specific command, check if we're in the right guild
    if (
      source instanceof CommandInteraction &&
      source.guildId &&
      loadedCommand.guilds?.length &&
      !loadedCommand.guilds.includes(source.guildId)
    ) {
      return null;
    }

    // Handle subcommand execution if applicable
    let loadedSubCommand: LoadedSubCommand | null = null;
    if (subcommandName) {
      // Build a path to look up the subcommand
      let subcommandPath = `${loadedCommand.command.id}/${subcommandName}`;
      if (subcommandGroupName) {
        subcommandPath = `${loadedCommand.command.id}/${subcommandGroupName}/${subcommandName}`;
      }

      // Find the subcommand by its path
      const subCommandId = this.subcommandPathToId.get(subcommandPath);
      if (subCommandId) {
        loadedSubCommand = this.loadedSubCommands.get(subCommandId) || null;
      }
    }

    // Collect all applicable middleware
    const middlewares: LoadedMiddleware[] = [];

    // Add command-level middleware
    for (const middlewareId of loadedCommand.command.middlewareIds) {
      const middleware = this.loadedMiddlewares.get(middlewareId);
      if (middleware) {
        middlewares.push(middleware);
      }
    }

    // No middleware for subcommands since they inherit from parent command
    return {
      command: loadedCommand,
      subcommand: loadedSubCommand,
      middlewares,
      messageCommandParser: parser,
    };
  }

  public async reloadCommands() {
    this.loadedCommands.clear();
    this.loadedSubCommands.clear();
    this.loadedMiddlewares.clear();
    this.commandNameToId.clear();
    this.subcommandPathToId.clear();

    await this.loadCommands();
  }

  public async loadCommands() {
    const commandsRouter = this.commandkit.commandsRouter;

    if (!commandsRouter) {
      throw new Error('Commands router has not yet initialized');
    }

    const { commands, middlewares } = commandsRouter.getData();

    // Load middlewares first
    for (const [id, middleware] of middlewares) {
      await this.loadMiddleware(id, middleware);
    }

    // Load commands
    for (const [id, command] of commands) {
      await this.loadCommand(id, command);
    }

    // Load subcommands
    for (const loadedCommand of this.loadedCommands.values()) {
      if (loadedCommand.command.subcommands) {
        for (const subcommand of loadedCommand.command.subcommands) {
          await this.loadSubcommand(subcommand);
        }
      }
    }
  }

  private async loadMiddleware(id: string, middleware: ParsedMiddleware) {
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

  private async loadCommand(id: string, command: ParsedCommand) {
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

      const localizedCommand = await this.applyLocalizations({
        ...data.command,
      });

      this.loadedCommands.set(id, {
        command,
        guilds: data.guilds,
        data: {
          ...data,
          command: localizedCommand,
        },
      });

      // Map command name to ID for easier lookup
      this.commandNameToId.set(command.name, id);
    } catch (error) {
      Logger.error(`Failed to load command ${command.name} (${id})`, error);
    }
  }

  private async loadSubcommand(subcommand: ParsedSubCommand) {
    try {
      const data = await import(
        `${toFileURL(subcommand.path)}?t=${Date.now()}`
      );

      if (!data.command) {
        throw new Error(
          `Invalid export for subcommand ${subcommand.name}: no command definition found`,
        );
      }

      let handlerCount = 0;
      for (const [key, validator] of Object.entries(commandDataSchema)) {
        if (key !== 'command' && data[key]) handlerCount++;
        if (data[key] && !(await validator(data[key]))) {
          throw new Error(
            `Invalid export for subcommand ${subcommand.name}: ${key} does not match expected value`,
          );
        }
      }

      if (handlerCount === 0) {
        throw new Error(
          `Invalid export for subcommand ${subcommand.name}: at least one handler function must be provided`,
        );
      }

      const localizedCommand = await this.applyLocalizations(
        { ...data.command },
        subcommand,
      );

      const subcommandId = subcommand.command + '/' + subcommand.name;
      this.loadedSubCommands.set(subcommandId, {
        subcommand,
        data: {
          ...data,
          command: localizedCommand,
        },
      });

      // Map subcommand path to ID for easier lookup
      this.subcommandPathToId.set(subcommandId, subcommandId);
    } catch (error) {
      Logger.error(`Failed to load subcommand ${subcommand.name}`, error);
    }
  }

  public async applyLocalizations(
    command: CommandBuilderLike,
    subcommand?: ParsedSubCommand,
  ) {
    const localization = this.commandkit.config.localizationStrategy;
    const validLocales = Object.values(Locale).filter(
      (v) => typeof v === 'string',
    );

    // For subcommands, use parent command's name to locate translations
    const localizationKey = subcommand
      ? command.name.split('/')[0] // Get parent command name if this is a subcommand
      : command.name;

    for (const locale of validLocales) {
      const translation = await localization.locateTranslation(
        localizationKey,
        locale,
      );
      if (!translation?.command) continue;

      if (command instanceof SlashCommandBuilder) {
        // Apply command-level localizations
        if (translation.command.name) {
          command.setNameLocalization(locale, translation.command.name);
        }

        if (translation.command.description) {
          command.setDescriptionLocalization(
            locale,
            translation.command.description,
          );
        }

        const raw = command.toJSON();

        if (raw.options?.length && translation.command.options?.length) {
          const opt = translation.command.options.slice();
          let o: TranslatableCommandOptions;

          while ((o = opt.shift()!)) {
            raw.options?.forEach((option) => {
              // For subcommands, only apply localizations if they match the current subcommand
              if (subcommand && option.name !== subcommand.name) return;

              if (option.name === o.ref) {
                if (option.name) {
                  option.name_localizations ??= {};
                  option.name_localizations[locale] = o.name;
                }

                if (option.description) {
                  option.description_localizations ??= {};
                  option.description_localizations[locale] = o.description;
                }

                const opts = (
                  option as typeof option & {
                    options: ApiTranslatableCommandOptions[] | undefined;
                  }
                ).options;

                // Handle nested options (subcommand parameters)
                if (opts?.length && o.options?.length) {
                  o.options.forEach((subOpt) => {
                    const targetOption = opts?.find(
                      (opt) => opt.name === subOpt.name,
                    );
                    if (targetOption) {
                      targetOption.name_localizations ??= {};
                      targetOption.name_localizations[locale] = subOpt.name;

                      if ('description' in targetOption) {
                        targetOption.description_localizations ??= {};
                        targetOption.description_localizations[locale] =
                          subOpt.description;
                      }
                    }
                  });
                }
              }
            });
          }
        }
      } else if (command instanceof ContextMenuCommandBuilder) {
        if (translation.command.name) {
          command.setNameLocalization(locale, translation.command.name);
        }
      } else {
        // Raw command object
        command.name_localizations ??= {};
        command.name_localizations[locale] = translation.command.name;

        if (!subcommand && command.description) {
          command.description_localizations ??= {};
          command.description_localizations[locale] =
            translation.command.description;
        }

        if (command.options?.length && translation.command.options?.length) {
          const opt = translation.command.options.slice();
          let o: TranslatableCommandOptions;

          while ((o = opt.shift()!)) {
            command.options.forEach((option: any) => {
              // For subcommands, only apply localizations if they match the current subcommand
              if (subcommand && option.name !== subcommand.name) return;

              if (option.name === o.ref) {
                option.name_localizations ??= {};
                option.name_localizations[locale] = o.name;

                if ('description' in option) {
                  option.description_localizations ??= {};
                  option.description_localizations[locale] = o.description;
                }

                const opts = option.options as ApiTranslatableCommandOptions[];

                // Handle nested options (subcommand parameters)
                if (opts?.length && o.options?.length) {
                  o.options.forEach((subOpt) => {
                    const targetOption = opts?.find(
                      (opt) => opt.name === subOpt.name,
                    );
                    if (targetOption) {
                      targetOption.name_localizations ??= {};
                      targetOption.name_localizations[locale] = subOpt.name;

                      if ('description' in targetOption) {
                        targetOption.description_localizations ??= {};
                        targetOption.description_localizations[locale] =
                          subOpt.description;
                      }
                    }
                  });
                }
              }
            });
          }
        }
      }
    }

    return command;
  }
}
