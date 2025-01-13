import {
  SlashCommandProps,
  CommandData,
  unstable_cacheTag as cacheTag,
} from 'commandkit';
import { setTimeout } from 'node:timers/promises';
import { database } from '../../database/store';

export const data: CommandData = {
  name: 'xp',
  description: 'This is an xp command.',
};

async function getUserXP(guildId: string, userId: string) {
  'use cache';

  cacheTag(`xp:${guildId}:${userId}`);

  const xp: number = (await database.get(`${guildId}:${userId}`)) ?? 0;

  return xp;
}

export async function run({ interaction }: SlashCommandProps) {
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
