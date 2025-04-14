import {
  MessageCommandContext,
  ChatInputCommandContext,
  UserContextMenuCommandContext,
} from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';

export const command = {
  name: 'avatar',
  description: 'This is an avatar command.',
  options: [
    {
      name: 'user',
      description: 'The user to get the avatar for.',
      type: ApplicationCommandOptionType.User,
    },
  ],
};

export async function userContextMenu(ctx: UserContextMenuCommandContext) {
  const target = ctx.interaction.targetUser;

  const { t } = ctx.locale();

  await ctx.interaction.reply({
    embeds: [
      {
        title: t('avatar', {
          user: target.username,
        }),
        image: {
          url: target.displayAvatarURL({ size: 2048 }),
        },
        color: 0x7289da,
      },
    ],
  });
}

export async function chatInput(ctx: ChatInputCommandContext) {
  const user = ctx.options.getUser('user') ?? ctx.interaction.user;
  const { t } = ctx.locale();

  await ctx.interaction.reply({
    embeds: [
      {
        title: t('avatar', {
          user: user.username,
        }),
        image: {
          url: user.displayAvatarURL({ size: 2048 }),
        },
        color: 0x7289da,
      },
    ],
  });
}

export async function message(ctx: MessageCommandContext) {
  const user = ctx.options.getUser('user') ?? ctx.message.author;
  const { t } = ctx.locale();

  await ctx.message.reply({
    embeds: [
      {
        title: t('avatar', {
          user: user.username,
        }),
        image: {
          url: user.displayAvatarURL({ size: 2048 }),
        },
        color: 0x7289da,
      },
    ],
  });
}
