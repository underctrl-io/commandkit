import { Locale } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import {
  LocalizationStrategy,
  LocalizationTranslationRequest,
  TranslationResult,
} from './LocalizationStrategy';
import { Translation } from './Translation';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { getConfig } from '../../config/config';
import { existsSync } from 'node:fs';
import { COMMANDKIT_IS_DEV } from '../../utils/constants';

export class DefaultLocalizationStrategy implements LocalizationStrategy {
  private translations: Map<string, Translation> = new Map();

  public constructor(private readonly commandkit: CommandKit) {}

  public async locateTranslation(scope: string, locale: Locale) {
    const localesPath = this.commandkit.getPath('locales');

    if (!localesPath) return null;

    const paths = ['.js', '.json', '.mjs', '.cjs'].map(
      (e) => join(localesPath, locale, scope) + e,
    );

    for (const path of paths) {
      if (!existsSync(path)) {
        continue;
      }

      try {
        let localeData: Translation;

        try {
          if (path.endsWith('.json')) {
            const data = await readFile(path, 'utf-8');
            localeData = JSON.parse(data) as Translation;
          } else {
            const { default: data } = await import(`file://${path}`);
            localeData = data as Translation;
          }
        } catch {
          continue;
        }

        if (!localeData) continue;

        await this.generateLocaleTypes(localeData).catch(() => {});

        return localeData;
      } catch {
        return null;
      }
    }

    return null;
  }

  private async generateLocaleTypes(localeData: Translation) {
    if (!COMMANDKIT_IS_DEV) return;
    const { typedLocales } = getConfig();

    if (!typedLocales) return;

    const file = join(
      process.cwd(),
      'node_modules',
      'commandkit-types',
      'locale_types.d.ts',
    );

    const header = `// auto generated file do not edit\nexport {};\ndeclare module 'commandkit' {\n  export interface CommandLocalizationTypeData {\n`;
    const footer = `  }\ntype TranslatableCommandName = keyof CommandLocalizationTypeData\n}`;

    const generateType = (locale: Translation) => {
      // Create type definition for this command's translations
      const commandName = locale.command.name;
      const translationTypes = Object.entries(locale.translations)
        .map(([key, value]) => {
          // Extract arguments from translation string (e.g. {xyz})
          const args = value.match(/{([^}]+)}/g);

          if (!args) {
            return `    "${key}": null`;
          }

          // Create a union type of all arguments
          const argUnion = args
            .map((arg) => `"${arg.slice(1, -1)}"`)
            .join(' | ');

          return `    "${key}": ${argUnion}`;
        })
        .join(',\n');

      return `  "${commandName}": {\n${translationTypes}\n  }`;
    };

    try {
      let commandDefinitions = new Map<string, string>();

      // If file exists, parse its content
      if (existsSync(file)) {
        try {
          const data = await readFile(file, 'utf-8');
          const content = data.toString();

          // Extract existing command definitions using regex
          const regex = /"([^"]+)":\s*\{([^}]*)\}/gs;
          let match;

          while ((match = regex.exec(content)) !== null) {
            const [fullMatch, commandName] = match;
            if (commandName !== localeData.command.name) {
              commandDefinitions.set(commandName, fullMatch);
            }
          }
        } catch (err) {
          // If we can't parse the file, we'll just create a new one
          console.warn('Could not parse existing type file, creating new one');
        }
      }

      // Add current command definition
      const newCommandType = generateType(localeData);
      commandDefinitions.set(localeData.command.name!, newCommandType);

      // Create the final type file content
      let fileContent = header;
      const entries = Array.from(commandDefinitions.values());

      fileContent += entries.join(',\n');
      fileContent += '\n' + footer;

      // Ensure directory exists
      const dir = join(process.cwd(), 'node_modules', 'commandkit-types');
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      // Write the file
      await writeFile(file, fileContent);
    } catch (error) {
      console.error('Failed to generate locale types:', error);
      // Continue execution even if type generation fails
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
