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
