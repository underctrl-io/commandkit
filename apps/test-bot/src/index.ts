import { CommandKit } from 'commandkit';
import { Client } from 'discord.js';
import 'dotenv/config';

const client = new Client({
  intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

new CommandKit({
  client,
  commandsPath: `${__dirname}/commands`,
  eventsPath: `${__dirname}/events`,
  validationsPath: `${__dirname}/validations`,
  devGuildIds: process.env.DEV_GUILD_ID?.split(',') ?? [],
  devUserIds: process.env.DEV_USER_ID?.split(',') ?? [],
  bulkRegister: true,
});

await client.login(process.env.TOKEN);
