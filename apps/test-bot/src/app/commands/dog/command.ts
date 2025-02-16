import type { CommandData, SlashCommand, MessageCommand } from 'commandkit';

export const command: CommandData = {
  name: 'dog',
  description: 'dog command',
};

export const chatInput: SlashCommand = async (ctx) => {
  await ctx.interaction.reply('Hello from dog!');
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply('Hello from dog!');
};
