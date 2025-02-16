import { CommandKit } from 'commandkit';
import { Client } from 'discord.js';

process.loadEnvFile();

const client = new Client({
  intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

const commandkit = new CommandKit({
  // @ts-ignore
  client,
  commandsPath: `${__dirname}/commands`,
  eventsPath: `${__dirname}/events`,
  validationsPath: `${__dirname}/validations`,
  devGuildIds: process.env.DEV_GUILD_ID?.split(',') ?? [],
  devUserIds: process.env.DEV_USER_ID?.split(',') ?? [],
  bulkRegister: true,
});

commandkit.setPrefixResolver(() => ['!', '?']);

await commandkit.start();
