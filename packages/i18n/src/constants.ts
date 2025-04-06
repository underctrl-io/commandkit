import { Locale } from 'discord.js';

export const DISCORD_LOCALES = new Set(
  Object.values(Locale).filter((locale) => !/^\d+/.test(locale)),
);

export const COMMAND_METADATA_KEY = '$command';
