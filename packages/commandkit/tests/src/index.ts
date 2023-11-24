import { CommandKit } from '../../src/index';
import { Client } from 'discord.js';

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

console.log('io23hfio3h3iohgio3');
throw new Error('oh no');

await client.login(process.env.TOKEN);
