import { Locale } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import {
  LocalizationStrategy,
  LocalizationTranslationRequest,
  TranslationResult,
} from './LocalizationStrategy';
import { Translation } from './Translation';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getConfig } from '../../config/config';
import { existsSync } from 'node:fs';

export class DefaultLocalizationStrategy implements LocalizationStrategy {
  private translations: Map<string, Translation> = new Map();

  public constructor(private readonly commandkit: CommandKit) {}

  public async locateTranslation(scope: string, locale: Locale) {
    const localesPath = this.commandkit.getPath('locales');

    if (!localesPath) return null;

    const path = join(localesPath, locale, `${scope}.json`);

    try {
      const data = await readFile(path, 'utf-8');

      const localeData = JSON.parse(data) as Translation;

      await this.generateLocaleTypes(localeData);

      return localeData;
    } catch {
      return null;
    }
  }

  private async generateLocaleTypes(localeData: Translation) {
    const { typedLocales } = getConfig();
    if (!typedLocales) return;

    const file = join(
      process.cwd(),
      'node_modules',
      'commandkit-types',
      'locale_types.d.ts',
    );

    const header = `// auto generated file do not edit\ndeclare module 'commandkit' {\n  export interface CommandLocalizationTypeData {\n`;
    const footer = `  }\n}`;

    const generateType = (locale: Translation) => {
      return `"${locale.command}": ${JSON.stringify(
        Object.entries(locale.translations).map(([key, value]) => {
          // if value contains {xyz} then we need to parse it as an argument
          // so that it can be autocompleted
          const args = value.match(/{([^}]+)}/g);

          if (!args) return `${JSON.stringify(key)}: null`;

          return `${JSON.stringify(key)}: ${args.map((arg) => arg.slice(1, -1)).join(' | ')}`;
        }),
        null,
        2,
      )}`;
    };

    if (!existsSync(file)) {
      const generated = generateType(localeData);

      await writeFile(file, `${header}${generated}${footer}`);
    } else {
      const data = await readFile(file, 'utf-8');

      const lines = data.split('\n');

      const index = lines.findIndex((line) =>
        line.includes('CommandLocalizationTypeData'),
      );

      if (index === -1) {
        for (const locale of this.translations.values()) {
          const generated = generateType(locale);

          await writeFile(file, `${header}${generated}${footer}`);
        }
        return;
      }

      const start = index + 2;

      const end = lines.findIndex((line) => line.includes('}'));

      const generated = generateType(localeData);

      lines.splice(start, end - start, generated);

      await writeFile(file, lines.join('\n'));
    }
  }

  public async getTranslationStrict(scope: string, locale: Locale) {
    const key = `${scope}:${locale}`;
    if (!this.translations.has(key)) {
      const translation = await this.locateTranslation(scope, locale);

      if (!translation) {
        throw new Error(`Translation not found for ${key}`);
      }

      this.translations.set(key, translation);

      return translation;
    }

    return this.translations.get(key)!;
  }

  public async getTranslation(
    scope: string,
    locale: Locale,
  ): Promise<Translation | null> {
    try {
      return this.getTranslationStrict(scope, locale);
    } catch (e) {
      return null;
    }
  }

  public async translate(
    request: LocalizationTranslationRequest,
  ): Promise<TranslationResult> {
    const { scope, key, args, locale } = request;

    const translation = await this.getTranslation(scope, locale);

    if (!translation) return `${scope}.${key}`;

    const value = translation.translations[key];

    const translated = this.applyTranslation(value, args);

    return translated || `${scope}.${key}`;
  }

  private applyTranslation(
    translation: string,
    args?: Record<string, any>,
  ): string {
    if (!translation || !args) return translation;

    return translation.replace(/{([^}]+)}/g, (_, key) => {
      return String(args[key] ?? `{${key}}`);
    });
  }
}
