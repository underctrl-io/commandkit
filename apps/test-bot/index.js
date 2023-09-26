const { CommandKit } = require('commandkit');
const { Client } = require('discord.js');
require('dotenv/config');

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'],
});

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    validationsPath: `${__dirname}/validations`,
    devGuildIds: ['1049345075366334617'],
    devUserIds: ['1049343381903515778'],
});

client.login(process.env.TOKEN);
