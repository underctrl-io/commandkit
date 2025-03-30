import { CommandData, MessageCommand, SlashCommand } from 'commandkit';

export const command: CommandData = {
  name: 'forward',
  description: 'Forwards this command to another command',
};

export const chatInput: SlashCommand = async (ctx) => {
  await ctx.forwardCommand('forwarded');
};

export const message: MessageCommand = async (ctx) => {
  await ctx.forwardCommand('forwarded');
};
