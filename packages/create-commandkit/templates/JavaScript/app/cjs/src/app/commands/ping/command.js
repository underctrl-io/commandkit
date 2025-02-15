// import { SlashCommandContext, MessageCommandContext } from 'commandkit';
module.exports.command = {
  name: 'ping',
  description: "Ping the bot to check if it's online.",
};

module.exports.chatInput = async (ctx) => {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.interaction.reply(response);
};

module.exports.message = async (ctx) => {
  const { t } = ctx.locale();

  const latency = ctx.client.ws.ping ?? -1;
  const response = await t('ping_response', { latency });

  await ctx.message.reply(response);
};
