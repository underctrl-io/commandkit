import {
  type CommandData,
  type SlashCommand,
  type MessageCommand,
  Logger,
} from 'commandkit';

export const command: CommandData = {
  name: 'server',
  description: 'server command',
  guilds: [process.env.DEV_GUILD_ID],
};

export const chatInput: SlashCommand = async (ctx) => {
  Logger.log('Running server command');
  await ctx.interaction.reply('Hello from server!');
};

export const message: MessageCommand = async (ctx) => {
  Logger.log('Running server command');
  await ctx.message.reply('Hello from server!');
};
