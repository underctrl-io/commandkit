import { Client } from 'discord.js';
import { Logger, commandkit } from 'commandkit';
import { setDriver } from '@commandkit/tasks';
import { HyperCronDriver } from '@commandkit/tasks/hypercron';
import './ai.ts';

const client = new Client({
  intents: [
    'Guilds',
    'GuildMembers',
    'GuildMessages',
    'MessageContent',
    'GuildMessageTyping',
  ],
});

setDriver(new HyperCronDriver());

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
