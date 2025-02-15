export const command = {
  name: 'ping',
  description: "Ping the bot to check if it's online.",
};

/**
 * @param {import('commandkit').SlashCommandContext} ctx
 */
export async function chatInput(ctx) {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.interaction.reply(response);
}

/**
 * @param {import('commandkit').MessageCommandContext} ctx
 */
export async function message(ctx) {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.message.reply(response);
}
