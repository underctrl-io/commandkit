/**
 * @type {import('commandkit').CommandData}
 */
export const command = {
  name: 'ping',
  description: "Ping the bot to check if it's online.",
};

/**
 * @param {import('commandkit').ChatInputCommandContext} ctx
 */
export const chatInput = async (ctx) => {
  const latency = (ctx.client.ws.ping ?? -1).toString();
  const response = `Pong! Latency: ${latency}ms`;

  await ctx.interaction.reply(response);
};

/**
 * @param {import('commandkit').MessageCommandContext} ctx
 */
export const message = async (ctx) => {
  const latency = (ctx.client.ws.ping ?? -1).toString();
  const response = `Pong! Latency: ${latency}ms`;

  await ctx.message.reply(response);
};
