import { Logger, MiddlewareContext } from 'commandkit';
import { MessageFlags } from 'discord.js';

export function beforeExecute(ctx: MiddlewareContext) {
  Logger.info('Pre-command middleware');

  const user = ctx.isInteraction() ? ctx.interaction.user : ctx.message.author;

  if (user.id !== '12345678901234567890') {
    if (ctx.isSlashCommand()) {
      ctx.interaction.reply({
        content: 'You are not allowed to use this command.',
        flags: MessageFlags.Ephemeral,
      });
    } else {
      ctx.message.reply('You are not allowed to use this command.');
    }

    ctx.cancel();
  }
}

export function afterExecute(ctx: MiddlewareContext) {
  Logger.info('Post-command middleware executed');
}
