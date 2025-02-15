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
  eventsPath: join(__dirname, 'events'),
  commandsPath: join(__dirname, 'commands'),
});

commandkit.start(process.env.DISCORD_TOKEN);
