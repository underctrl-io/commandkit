import { CommandKit } from '../src';
import { Client } from 'discord.js';
import { config } from 'dotenv';

config({ path: `${__dirname}/.env` });

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    validationsPath: `${__dirname}/validations`,
});

client.login(process.env.TOKEN);
