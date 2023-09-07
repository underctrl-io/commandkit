import { CommandKit } from '../src/index';
import { Client } from 'discord.js';
import { config } from 'dotenv';

config({ path: `${__dirname}/.env` });

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

client.on('ready', (c) => console.log(`${c.user.username} is online`));

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
});

client.login(process.env.TOKEN);
