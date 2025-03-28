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

// Define command-specific type structure
export interface CommandLocalizationTypeData {
  [key: string]: Record<string, string | null>;
}

export type TranslatableCommandName = string & {};

export interface Translation {
  command: TranslatableCommand;
  translations: Record<string, string>;
}

// Improved type definition for TranslatableArguments
export type TranslatableArguments<T extends TranslatableCommandName> =
  T extends TranslatableCommandName
    ? CommandLocalizationTypeData[T] extends Record<string, infer ArgType>
      ? ArgType extends null
        ? never
        : Record<string, string>
      : Record<string, string>
    : Record<string, string>;
