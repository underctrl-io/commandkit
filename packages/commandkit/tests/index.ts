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
    devGuildIds: ['1004792054783688775'], //'1049345075366334617'
    devUserIds: ['1002401206750150836'], //'1049343381903515778'
    bulkRegister: true,
});

client.login(process.env.TOKEN);
