import { Locale } from 'discord.js';

export interface LocalizationTranslationRequest {
  locale: Locale;
  scope: string;
  key: string;
  args: Record<string, any>;
}

export type TranslationResult = string;

export interface LocalizationStrategy {
  translate(
    request: LocalizationTranslationRequest,
  ): Promise<TranslationResult>;
}
