import { ChatInputCommandContext, CommandData } from 'commandkit';
import { database } from '../../../database/store.ts';
import { cacheTag } from '@commandkit/cache';

export const command: CommandData = {
  name: 'xp',
  description: 'This is an xp command.',
};

async function getUserXP(guildId: string, userId: string) {
  'use cache';

  const key = `xp:${guildId}:${userId}`;
  cacheTag(key);

  const xp: number = (await database.get(key)) ?? 0;

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
