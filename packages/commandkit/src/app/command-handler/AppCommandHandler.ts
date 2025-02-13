import { ParsedCommand, ParsedMiddleware } from '@commandkit/router';
import type { CommandKit } from '../../CommandKit';
import {
  Awaitable,
  Collection,
  ContextMenuCommandBuilder,
  Interaction,
  Locale,
  Message,
  SlashCommandBuilder,
} from 'discord.js';
import { Context } from '../commands/Context';
import { toFileURL } from '../../utils/resolve-file-url';
import { TranslatableCommandOptions } from '../i18n/Translation';
import { MessageCommandParser } from '../commands/MessageCommandParser';
import { CommandKitErrorCodes, isErrorType } from '../../utils/error-codes';

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

interface LoadedCommand {
  command: ParsedCommand;
  data: AppCommand;
}

interface LoadedMiddleware {
  middleware: ParsedMiddleware;
  data: AppCommandMiddleware;
}

export interface PreparedAppCommandExecution {
  command: LoadedCommand;
  middlewares: LoadedMiddleware[];
  messageCommandParser?: MessageCommandParser;
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
  private loadedMiddlewares = new Collection<string, LoadedMiddleware>();

  public constructor(public readonly commandkit: CommandKit) {}

  public getCommandsArray() {
    return Array.from(this.loadedCommands.values()).map((v) => {
      if ('toJSON' in v && typeof v.toJSON === 'function') return v.toJSON();
      return v.data.command;
    });
  }

  public async prepareCommandRun(
    source: Interaction | Message,
  ): Promise<PreparedAppCommandExecution | null> {
    let cmd: string;
    let parser: MessageCommandParser | undefined;

    if (source instanceof Message) {
      if (source.author.bot) return null;

      const prefix =
        await this.commandkit.config.getMessageCommandPrefix(source);

      parser = new MessageCommandParser(
        source,
        Array.isArray(prefix) ? prefix : [prefix],
        (command: string) => {
          const loadedCommand = this.loadedCommands.find((c) => {
            return c.data.command.name === command;
          });

          if (!loadedCommand) return null;

          const json =
            'toJSON' in loadedCommand.data.command
              ? loadedCommand.data.command.toJSON()
              : loadedCommand.data.command;

          return json.options.reduce(
            (acc: Record<string, unknown>, opt: Record<string, any>) => {
              acc[opt.name] = opt.type;
              return acc;
            },
            {} as Record<string, unknown>,
          );
        },
      );

      try {
        cmd = parser.getFullCommand();
      } catch (e) {
        if (isErrorType(e, CommandKitErrorCodes.InvalidCommandPrefix)) {
          return null;
        }

        console.error(e);
        return null;
      }
    } else {
      if (!source.isCommand()) return null;

      cmd = source.commandName;

      if (source.isChatInputCommand()) {
        const subcommandGroup = source.options.getSubcommandGroup(false);
        const subcommand = source.options.getSubcommand(false);

        if (subcommandGroup) {
          cmd += ` ${subcommandGroup}`;
        }

        if (subcommand) {
          cmd += ` ${subcommand}`;
        }
      }
    }

    const loadedCommand = this.loadedCommands.find((c) => {
      return c.data.command.name === cmd;
    });

    if (!loadedCommand) return null;

    return {
      command: loadedCommand,
      middlewares: loadedCommand.command.middlewares
        .map((m) => this.loadedMiddlewares.get(m))
        .filter((m): m is LoadedMiddleware => !!m),
      messageCommandParser: parser,
    };
  }

  public async loadCommands() {
    const commandsRouter = this.commandkit.commandsRouter;

    if (!commandsRouter) {
      throw new Error('Commands router has not yet initialized');
    }

    const { commands, middleware } = commandsRouter.getData();

    for (const [id, md] of middleware) {
      const data = await import(`${toFileURL(md.fullPath)}?t=${Date.now()}`);

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

      this.loadedMiddlewares.set(id, { middleware: md, data });
    }

    for (const [name, command] of commands) {
      const data = await import(
        `${toFileURL(command.fullPath)}?t=${Date.now()}`
      );

      if (!data.command) {
        throw new Error(
          `Invalid export for command ${name}: no command definition found`,
        );
      }

      let handlerCount = 0;

      for (const [key, validator] of Object.entries(commandDataSchema)) {
        if (key !== 'command' && data[key]) handlerCount++;
        if (data[key] && !(await validator(data[key]))) {
          throw new Error(
            `Invalid export for command ${name}: ${key} does not match expected value`,
          );
        }
      }

      if (handlerCount === 0) {
        throw new Error(
          `Invalid export for command ${name}: at least one handler function must be provided`,
        );
      }

      const localizedCommand = await this.applyLocalizations({
        ...data.command,
      });

      this.loadedCommands.set(name, {
        command,
        data: {
          ...data,
          command: localizedCommand,
        },
      });
    }
  }

  public async applyLocalizations(command: CommandBuilderLike) {
    const localization = this.commandkit.config.localizationStrategy;

    const validLocales = Object.values(Locale).filter(
      (v) => typeof v === 'string',
    );

    for (const locale of validLocales) {
      const translation = await localization.locateTranslation(
        command.name,
        locale,
      );

      if (!translation?.command) continue;

      if (command instanceof SlashCommandBuilder) {
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
              if (option.name === o.ref) {
                if (option.name) {
                  option.name_localizations ??= {};
                  option.name_localizations[locale] = o.name;
                }

                if (option.description) {
                  option.description_localizations ??= {};
                  option.description_localizations[locale] = o.description;
                }
              }
            });
          }
        }
      } else if (command instanceof ContextMenuCommandBuilder) {
        if (translation.command.name) {
          command.setNameLocalization(locale, translation.command.name);
        }

        const raw = command.toJSON();

        return raw;
      } else {
        command.name_localizations ??= {};
        command.name_localizations[locale] = translation.command.name;

        if (command.description) {
          command.description_localizations ??= {};
          command.description_localizations[locale] =
            translation.command.description;
        }

        if (command.options?.length && translation.command.options?.length) {
          const opt = translation.command.options.slice();
          let o: TranslatableCommandOptions;

          while ((o = opt.shift()!)) {
            command.options.forEach((option: any) => {
              if (option.name === o.ref) {
                if (option.name) {
                  option.name_localizations ??= {};
                  option.name_localizations[locale] = o.name;
                }

                if (option.description) {
                  option.description_localizations ??= {};
                  option.description_localizations[locale] = o.description;
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
