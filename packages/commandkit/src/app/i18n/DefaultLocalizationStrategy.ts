import { Locale } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import {
  LocalizationStrategy,
  LocalizationTranslationRequest,
  TranslationResult,
} from './LocalizationStrategy';
import { Translation } from './Translation';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export class DefaultLocalizationStrategy implements LocalizationStrategy {
  private translations: Map<string, Translation> = new Map();

  public constructor(private readonly commandkit: CommandKit) {}

  public async locateTranslation(scope: string, locale: Locale) {
    const localesPath = this.commandkit.getPath('locales');

    if (!localesPath) return null;

    const path = join(localesPath, locale, `${scope}.json`);

    try {
      const data = await readFile(path, 'utf-8');

      return JSON.parse(data) as Translation;
    } catch {
      return null;
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
