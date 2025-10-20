import type { MiddlewareContext } from 'commandkit';

export async function beforeExecute(ctx: MiddlewareContext) {
  const guild = ctx.interaction?.guild ?? ctx.message?.guild;

  if (guild) return;

  if (
    ctx.isChatInputCommand() ||
    ctx.isUserContextMenu() ||
    ctx.isMessageContextMenu()
  ) {
    await ctx.interaction.reply({
      content: 'This command can only be used in a server.',
      ephemeral: true,
    });

    return ctx.cancel();
  }

  await ctx.message.reply({
    content: 'This command can only be used in a server.',
  });

  return ctx.cancel();
}
