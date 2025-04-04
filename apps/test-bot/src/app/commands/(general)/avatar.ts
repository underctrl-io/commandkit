import {
  MessageCommandContext,
  SlashCommandContext,
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

  await ctx.interaction.reply({
    embeds: [
      {
        title: `${target.username}'s Avatar`,
        image: {
          url: target.displayAvatarURL({ size: 2048 }),
        },
        color: 0x7289da,
      },
    ],
  });
}

export async function chatInput(ctx: SlashCommandContext) {
  const user = ctx.options.getUser('user') ?? ctx.interaction.user;

  await ctx.interaction.reply({
    embeds: [
      {
        title: `${user.username}'s Avatar`,
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

  await ctx.message.reply({
    embeds: [
      {
        title: `${user.username}'s Avatar`,
        image: {
          url: user.displayAvatarURL({ size: 2048 }),
        },
        color: 0x7289da,
      },
    ],
  });
}
