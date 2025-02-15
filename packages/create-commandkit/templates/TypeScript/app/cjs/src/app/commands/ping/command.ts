import { SlashCommandContext, MessageCommandContext } from 'commandkit';

export const command = {
  name: 'ping',
  description: "Ping the bot to check if it's online.",
};

export async function chatInput(ctx: SlashCommandContext) {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.interaction.reply(response);
}

export async function message(ctx: MessageCommandContext) {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.message.reply(response);
}
