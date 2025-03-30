/**
 * @type {import('commandkit').CommandData}
 */
export const command = {
  name: 'ping',
  description: "Ping the bot to check if it's online.",
};

/**
 * @param {import('commandkit').SlashCommandContext} ctx
 */
export const chatInput = async (ctx) => {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.interaction.reply(response);
};

/**
 * @param {import('commandkit').MessageCommandContext} ctx
 */
export const message = async (ctx) => {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.message.reply(response);
};
