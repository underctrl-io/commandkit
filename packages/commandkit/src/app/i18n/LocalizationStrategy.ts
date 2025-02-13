import type { Locale } from 'discord.js';
import type { Translation } from './Translation';

export interface LocalizationTranslationRequest {
  locale: Locale;
  scope: string;
  key: string;
  args?: Record<string, any> | undefined;
}

export type TranslationResult = string;

export interface LocalizationStrategy {
  locateTranslation(scope: string, locale: Locale): Promise<Translation | null>;
  getTranslation(scope: string, locale: Locale): Promise<Translation | null>;
  getTranslationStrict(scope: string, locale: Locale): Promise<Translation>;
  translate(
    request: LocalizationTranslationRequest,
  ): Promise<TranslationResult>;
}
