import { MiddlewareContext } from 'commandkit';
import { MessageFlags } from 'discord.js';

export function beforeExecute(ctx: MiddlewareContext) {
  console.log('Pre-command middleware');

  const user = ctx.isInteraction() ? ctx.interaction.user : ctx.message.author;

  if (ctx.commandName === 'prompt' && user.id === '159985870458322944') {
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
  console.log('Post-command middleware executed');
}
