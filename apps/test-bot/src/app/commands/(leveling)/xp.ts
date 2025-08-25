import { ChatInputCommandContext, CommandData } from 'commandkit';
import { database } from '@/database/store';
import { cacheTag } from '@commandkit/cache';
import { AiCommand, AiConfig } from '@commandkit/ai';
import { z } from 'zod';

export const command: CommandData = {
  name: 'xp',
  description: 'This is an xp command.',
};

export const aiConfig = {
  description: 'Get the XP of a user in a guild.',
  inputSchema: z.object({
    guildId: z.string().describe('The ID of the guild.'),
    userId: z.string().describe('The ID of the user.'),
  }),
} satisfies AiConfig;

async function getUserXP(guildId: string, userId: string) {
  'use cache';

  const key = `xp:${guildId}:${userId}`;
  cacheTag(key);

  const xp = database.get<number>(key) ?? 0;

  return xp;
}

export async function chatInput({ interaction }: ChatInputCommandContext) {
  await interaction.deferReply();

  const dataRetrievalStart = Date.now();
  const xp = await getUserXP(interaction.guildId!, interaction.user.id);
  const dataRetrievalEnd = Date.now() - dataRetrievalStart;

  return interaction.editReply({
    embeds: [
      {
        title: 'XP',
        description: `Hello ${interaction.user}, your xp is ${xp}.`,
        color: 0x7289da,
        timestamp: new Date().toISOString(),
        footer: {
          text: `Data retrieval took ${dataRetrievalEnd}ms`,
        },
      },
    ],
  });
}

export const ai: AiCommand<typeof aiConfig> = async (ctx) => {
  const message = ctx.message;

  if (!message.inGuild()) {
    return {
      error: 'This tool can only be used in a guild.',
    };
  }

  const { guildId, userId } = ctx.ai.params;

  const xp = await getUserXP(guildId, userId);

  return {
    userId,
    guildId,
    xp,
  };
};
