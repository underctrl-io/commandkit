import { Client } from 'discord.js';
import { Logger, commandkit } from 'commandkit';

const client = new Client({
  intents: [
    'Guilds',
    'GuildMembers',
    'GuildMessages',
    'MessageContent',
    'GuildMessageTyping',
  ],
});

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
