import { Client, Partials } from 'discord.js';
import { Logger, commandkit } from 'commandkit';
import config from './config.json' with { type: 'json' };

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

Logger.log('Application bootstrapped successfully!');

commandkit.setPrefixResolver((message) => {
  return [
    `<@${message.client.user.id}>`,
    `<@!${message.client.user.id}>`,
    '!',
    '?',
  ];
});

console.dir({ importedConfig: config }, { depth: null });

export default client;
