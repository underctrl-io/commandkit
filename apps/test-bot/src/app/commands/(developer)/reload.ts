import { CommandData, SlashCommand } from 'commandkit';

export const command: CommandData = {
  name: 'reload',
  description: 'Reload commands, events, and middlewares.',
};

export const chatInput: SlashCommand = async (ctx) => {
  await ctx.interaction.deferReply({ ephemeral: true });

  await ctx.commandkit.reloadCommands();
  await ctx.commandkit.reloadEvents();

  ctx.interaction.followUp('Done!');
};
