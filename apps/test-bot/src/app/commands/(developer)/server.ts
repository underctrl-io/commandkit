import type { CommandData, SlashCommand, MessageCommand } from 'commandkit';

export const command: CommandData = {
  name: 'server',
  description: 'server command',
  guilds: [process.env.DEV_GUILD_ID],
};

export const chatInput: SlashCommand = async (ctx) => {
  await ctx.interaction.reply('Hello from server!');
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply('Hello from server!');
};
