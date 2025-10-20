import type { CommandData, ChatInputCommand, MessageCommand } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { prisma } from '@/database/db';

export const command: CommandData = {
  name: 'set-prefix',
  description: 'set-prefix command',
  options: [
    {
      name: 'prefix',
      description: 'prefix to set',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

async function updatePrefix(guildId: string, prefix: string) {
  const result = await prisma.guild.upsert({
    where: { id: guildId },
    update: { messagePrefix: prefix },
    create: { id: guildId, messagePrefix: prefix },
  });

  return result;
}

export const chatInput: ChatInputCommand = async (ctx) => {
  const { t } = ctx.locale();
  const prefix = ctx.options.getString('prefix', true);

  const result = await updatePrefix(ctx.interaction.guildId!, prefix);

  await ctx.interaction.reply({
    content: t('prefix_set', { prefix: result.messagePrefix }),
  });
};

export const message: MessageCommand = async (ctx) => {
  const { t } = ctx.locale();
  const prefix = ctx.options.getString('prefix', true);

  const result = await updatePrefix(ctx.message.guildId!, prefix);

  await ctx.message.reply({
    content: t('prefix_set', { prefix: result.messagePrefix }),
  });
};
