import { Client, IntentsBitField } from 'discord.js';
import { commandkit } from 'commandkit';
import { setCacheProvider } from '@commandkit/cache';
import { RedisCache } from '@commandkit/redis';
import { Font } from 'canvacord';
import { fetchGuildPrefix } from './utils/prefix-resolver';
import { redis } from './redis/redis';

// load the default font for canvacord
Font.loadDefault();

// set the prefix resolver for message commands
commandkit.setPrefixResolver((message) =>
  message.inGuild() ? fetchGuildPrefix(message.guildId) : '!',
);

setCacheProvider(new RedisCache(redis));

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

export default client;
