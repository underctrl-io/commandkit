import type { CommandData, SlashCommand, MessageCommand } from 'commandkit';

export const data: CommandData = {
  name: 'cat',
  description: 'cat command',
};

export const chatInput: SlashCommand = async (ctx) => {
  await ctx.interaction.reply('Hello from cat!');
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply('Hello from cat!');
};
