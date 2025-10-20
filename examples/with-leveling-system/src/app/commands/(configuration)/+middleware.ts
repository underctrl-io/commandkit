import type { MiddlewareContext } from 'commandkit';
import { GuildMember, PermissionFlagsBits } from 'discord.js';

export async function beforeExecute(ctx: MiddlewareContext) {
  const guild = ctx.interaction?.guild ?? ctx.message?.guild;

  if (guild) {
    const member = (ctx.isMessage()
      ? ctx.message.member
      : ctx.interaction.member)! as unknown as GuildMember;

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      const message = 'You do not have permission to use this command.';

      if (ctx.isMessage()) {
        await ctx.message.reply({ content: message });
      } else if (
        ctx.isChatInputCommand() ||
        ctx.isUserContextMenu() ||
        ctx.isMessageContextMenu()
      ) {
        await ctx.interaction.reply({
          content: message,
          ephemeral: true,
        });
      }

      return ctx.cancel();
    }

    return;
  }

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
