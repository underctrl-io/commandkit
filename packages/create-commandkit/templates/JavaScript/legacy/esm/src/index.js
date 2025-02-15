process.loadEnvFile();

import { Client, IntentsBitField } from 'discord.js';
import { CommandKit } from 'commandkit';

import { join } from 'node:path';

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const commandkit = new CommandKit({
  client,
  eventsPath: join(import.meta.dirname, 'events'),
  commandsPath: join(import.meta.dirname, 'commands'),
});

await commandkit.start(process.env.DISCORD_TOKEN);
