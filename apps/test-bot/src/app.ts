import { Client } from 'discord.js';

process.loadEnvFile();

const client = new Client({
  intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

export default client;
