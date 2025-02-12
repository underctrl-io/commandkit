export interface TranslatableCommand {
  name?: string;
  description?: string;
  options?: TranslatableCommandOptions[];
}

export interface TranslatableCommandOptions {
  ref: string;
  name?: string;
  description?: string;
}

export interface Translation {
  command: TranslatableCommand;
  translations: TranslatableArguments;
}

export type TranslatableArguments = Record<string, string>;
