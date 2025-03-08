import type { LocalizationMap } from 'discord.js';

export interface TranslatableCommand {
  name?: string;
  description?: string;
  options?: TranslatableCommandOptions[];
}

export interface TranslatableCommandOptions {
  ref: string;
  name?: string;
  description?: string;
  options?: TranslatableCommandOptions[];
}

export interface ApiTranslatableCommandOptions
  extends TranslatableCommandOptions {
  name_localizations?: LocalizationMap;
  description_localizations?: LocalizationMap;
}

export interface Translation {
  command: TranslatableCommand;
  translations: TranslatableArguments;
}

export type TranslatableArguments = Record<string, string>;
