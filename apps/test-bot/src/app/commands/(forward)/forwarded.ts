import { CommandData, MessageCommand, SlashCommand } from 'commandkit';

export const command: CommandData = {
  name: 'forwarded',
  description: 'Forwarded command response',
};

export const chatInput: SlashCommand = async (ctx) => {
  if (!ctx.forwarded) {
    return ctx.interaction.reply('This command was used directly');
  }

  await ctx.interaction.reply(
    `This command was forwarded from ${ctx.commandName}`,
  );
};

export const message: MessageCommand = async (ctx) => {
  if (!ctx.forwarded) {
    return ctx.message.reply('This command was used directly');
  }

  await ctx.message.reply(`This command was forwarded from ${ctx.commandName}`);
};
