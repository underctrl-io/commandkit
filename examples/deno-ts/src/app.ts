import { Client } from 'discord.js';

const client = new Client({
  intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

export default client;
