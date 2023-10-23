import { CommandKit } from '../src';
import { Client } from 'discord.js';
import { config } from 'dotenv';

config({ path: `${__dirname}/.env` });

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

new CommandKit({
    client,
    commandsPath: `./commands`,
    eventsPath: `./events`,
    validationsPath: `./validations`,
    devGuildIds: ['1049345075366334617'],
    devUserIds: ['1049343381903515778'],
    bulkRegister: true,
});

client.login(process.env.TOKEN);
