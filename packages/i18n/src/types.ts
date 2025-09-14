import {
  COMMAND_METADATA_KEY,
  MESSAGE_CTX_COMMAND_METADATA_KEY,
  USER_CTX_COMMAND_METADATA_KEY,
} from './constants';

/**
 * Represents the metadata for command translations.
 */
export interface CommandTranslationMetadata {
  /**
   * The name of the command.
   */
  name?: string;
  /**
   * The description of the command.
   */
  description?: string;
  /**
   * The options for the command.
   */
  options?: (
    | Record<'name' | 'description', string>
    | Record<string, Record<'name' | 'description', string>>
  )[];
}

/**
 * Represents the metadata for basic command translations.
 */
export interface BasicCommandTranslationMetadata {
  /**
   * The name of the command.
   */
  name?: string;
}

/**
 * Represents a command translation, including its metadata and translations.
 */
export interface CommandTranslation {
  /**
   * The metadata for the command translation.
   */
  [COMMAND_METADATA_KEY]: CommandTranslationMetadata;
  /**
   * The metadata for the user context menu command translation.
   */
  [USER_CTX_COMMAND_METADATA_KEY]: BasicCommandTranslationMetadata;
  /**
   * The metadata for the message context menu command translation.
   */
  [MESSAGE_CTX_COMMAND_METADATA_KEY]: BasicCommandTranslationMetadata;
  /**
   * The translations for the command, keyed by locale.
   */
  translations: Record<string, any>;
}
