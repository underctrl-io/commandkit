import { COMMAND_METADATA_KEY } from './constants';

export interface CommandTranslationMetadata {
  name?: string;
  description?: string;
  options?: (
    | Record<'name' | 'description', string>
    | Record<string, Record<'name' | 'description', string>>
  )[];
}

export interface CommandTranslation {
  [COMMAND_METADATA_KEY]: CommandTranslationMetadata;
  translations: Record<string, any>;
}
