import type { CommandData, ChatInputCommand, MessageCommand } from 'commandkit';

export const command: CommandData = {
  name: 'dog',
  description: 'dog command',
};

export const chatInput: ChatInputCommand = async (ctx) => {
  await ctx.interaction.reply('Hello from dog command!');
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply('Hello from dog!');
};
