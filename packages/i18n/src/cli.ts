import { CompilerPlugin, CompilerPluginRuntime, Logger } from 'commandkit';
import { DISCORD_LOCALES } from './constants';
import { Locale } from 'discord.js';
import { I18nPlugin } from './i18n';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Compiler plugin for the CommandKit CLI to create locale files.
 * This plugin allows users to create locale files for commands in the CLI.
 * It registers a template named "locale" that can be used to generate locale files.
 * @example ```sh
 * commandkit create locale <locale> <commandName>
 * ```
 */
export class I18nCliTemplatePlugin extends CompilerPlugin {
  public readonly name = 'I18nCliTemplatePlugin';

  public async activate(ctx: CompilerPluginRuntime): Promise<void> {
    try {
      ctx.registerTemplate('locale', this.handleTemplate.bind(this));
    } catch (e) {
      Logger.error(`Failed to register CLI template "locale": ${e}`);
    }
  }

  public async deactivate(ctx: CompilerPluginRuntime): Promise<void> {
    ctx.unregisterTemplate('locale');
  }

  private panic(message: string): never {
    Logger.error(message);
    process.exit(1);
  }

  private async handleTemplate(args: string[]): Promise<void> {
    if (args.length < 2) {
      this.panic(
        `Invalid arguments for locale template. Expected: <locale> <commandName>`,
      );
    }

    const [locale, commandName] = args;

    if (!DISCORD_LOCALES.has(locale as Locale)) {
      this.panic(
        `Invalid locale ${locale}. Please use one of the followings:\n${Array.from(
          DISCORD_LOCALES,
        )
          .map((l) => `- ${l}`)
          .join('\n')}`,
      );
    }

    const localePath = I18nPlugin.getLoadPath('src', locale, commandName);

    if (existsSync(localePath)) {
      this.panic(`Locale file for "${locale}:${commandName}" already exists.`);
    }

    const localeDirSrc = join(localePath, '..', '..');

    if (!existsSync(localeDirSrc)) {
      this.panic(
        `Could not locate source directory. Please make sure you are running this command from the location of your commandkit config file.`,
      );
    }

    const localeDir = join(localePath, '..');

    if (!existsSync(localeDir)) {
      mkdirSync(localeDir, { recursive: true });
    }

    const data = {
      $command: {
        name: commandName,
        description: `${commandName} command`,
      },
    };

    writeFileSync(localePath, JSON.stringify(data, null, 2));

    Logger.info(
      `Locale file for ${locale} and ${commandName} created at ${localePath}`,
    );
  }
}
