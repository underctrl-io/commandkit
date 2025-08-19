import {
  type CommandData,
  type ChatInputCommand,
  type MessageCommand,
  Logger,
  CommandMetadata,
} from 'commandkit';

export const command: CommandData = {
  name: 'server',
  description: 'server command',
};

export const metadata: CommandMetadata = {
  aliases: ['s', 'serv'],
  guilds: [process.env.DEV_GUILD_ID!],
};

export const chatInput: ChatInputCommand = async (ctx) => {
  Logger.log('Running server command');
  await ctx.interaction.reply('Hello from server!');
};

export const message: MessageCommand = async (ctx) => {
  Logger.log('Running server command');
  await ctx.message.reply('Hello from server!');
};
