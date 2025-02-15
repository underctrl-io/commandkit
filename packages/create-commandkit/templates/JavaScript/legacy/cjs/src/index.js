process.loadEnvFile();

const { Client, IntentsBitField } = require('discord.js');
const { CommandKit } = require('commandkit');
const { join } = require('path');

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
