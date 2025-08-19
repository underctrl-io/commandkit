import { Client, Partials } from 'discord.js';
import { Logger, commandkit } from 'commandkit';
import { setDriver } from '@commandkit/tasks';
import { SQLiteDriver } from '@commandkit/tasks/sqlite';
import './ai.ts';

const client = new Client({
  intents: [
    'Guilds',
    'GuildMembers',
    'GuildMessages',
    'MessageContent',
    'GuildMessageTyping',
    'DirectMessages',
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});

setDriver(new SQLiteDriver('./tasks.db'));

Logger.log('Application bootstrapped successfully!');

commandkit.setPrefixResolver((message) => {
  return [
    `<@${message.client.user.id}>`,
    `<@!${message.client.user.id}>`,
    '!',
    '?',
  ];
});

export default client;
