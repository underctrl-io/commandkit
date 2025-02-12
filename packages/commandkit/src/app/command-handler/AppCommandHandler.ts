import { ParsedCommand, ParsedMiddleware } from '@commandkit/router';
import type { CommandKit } from '../../CommandKit';
import {
  Awaitable,
  ContextMenuCommandBuilder,
  Locale,
  SlashCommandBuilder,
} from 'discord.js';
import { Context } from '../commands/Context';
import { toFileURL } from '../../utils/resolve-file-url';
import { TranslatableCommandOptions } from '../i18n/Translation';

interface AppCommand {
  options: SlashCommandBuilder | Record<string, any>;
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
  private loadedCommands = new Map<string, LoadedCommand>();
  private loadedMiddlewares = new Map<string, LoadedMiddleware>();

  public constructor(public readonly commandkit: CommandKit) {}

  public async prepareCommandRun(command: string) {
    const loadedCommand = this.loadedCommands.get(command);

    if (!loadedCommand) return null;

    return {
      command: loadedCommand,
      middlewares: loadedCommand.command.middlewares.map((m) =>
        this.loadedMiddlewares.get(m),
      ),
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

      data.command = await this.applyLocalizations(data.command);

      this.loadedCommands.set(name, { command, data });
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
  }
}
