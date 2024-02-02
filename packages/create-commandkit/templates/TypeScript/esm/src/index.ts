import 'dotenv/config';

import { Client, IntentsBitField } from 'discord.js';
import { CommandKit } from 'commandkit';

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

new CommandKit({
  client,
  eventsPath: join(__dirname, 'events'),
  commandsPath: join(__dirname, 'commands'),
});

client.login(process.env.TOKEN);
