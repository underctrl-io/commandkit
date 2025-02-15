process.loadEnvFile();

import { Client, IntentsBitField } from 'discord.js';
import { CommandKit } from 'commandkit';

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
});

await commandkit.start(process.env.DISCORD_TOKEN);
