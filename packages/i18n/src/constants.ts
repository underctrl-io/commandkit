import { Locale } from 'discord.js';

/**
 * Represents a set of locales supported by Discord.
 */
export const DISCORD_LOCALES = new Set(
  Object.values(Locale).filter((locale) => !/^\d+/.test(locale)),
);

/**
 * Metadata key for command localization.
 * This key is used to store metadata about commands in the i18n system.
 */
export const COMMAND_METADATA_KEY = '$command';

/**
 * Metadata key for user context menu command localization.
 * This key is used to store metadata about user context menu commands in the i18n system.
 */
export const USER_CTX_COMMAND_METADATA_KEY = '$command:user-ctx';

/**
 * Metadata key for message context menu command localization.
 * This key is used to store metadata about message context menu commands in the i18n system.
 */
export const MESSAGE_CTX_COMMAND_METADATA_KEY = '$command:message-ctx';
