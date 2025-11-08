import { greetUserWorkflow } from '@/workflows/greet/greet.workflow';
import type { CommandData, ChatInputCommand, MessageCommand } from 'commandkit';
import { start } from 'workflow/api';

export const command: CommandData = {
  name: 'greet',
  description: 'greet command',
};

export const chatInput: ChatInputCommand = async (ctx) => {
  await ctx.interaction.reply(`I'm gonna greet you :wink:`);

  await start(greetUserWorkflow, [ctx.interaction.user.id]);
};

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply(`I'm gonna greet you :wink:`);

  await start(greetUserWorkflow, [ctx.message.author.id]);
};
