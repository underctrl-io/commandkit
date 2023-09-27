import { fileURLToPath } from 'url';
import { CommandKit } from 'commandkit';
import { Client } from 'discord.js';
import path from 'path';
import 'dotenv/config';

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    validationsPath: `${__dirname}/validations`,
    devGuildIds: ['1049345075366334617'],
    devUserIds: ['1049343381903515778'],
});

client.login(process.env.TOKEN);
