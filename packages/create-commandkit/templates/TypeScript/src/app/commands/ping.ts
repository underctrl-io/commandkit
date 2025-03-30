import type { SlashCommand, MessageCommand, CommandData } from 'commandkit';

export const command: CommandData = {
  name: 'ping',
  description: "Ping the bot to check if it's online.",
};

export const chatInput: SlashCommand = async (ctx) => {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.interaction.reply(response);
};

export const message: MessageCommand = async (ctx) => {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.message.reply(response);
};
