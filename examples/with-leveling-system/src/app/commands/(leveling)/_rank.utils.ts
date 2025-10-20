import { cacheLife, cacheTag } from '@commandkit/cache';
import { LevelingModule } from '@/modules/leveling-module';
import { BuiltInGraphemeProvider, RankCardBuilder } from 'canvacord';
import { AttachmentBuilder, User } from 'discord.js';

async function fetchLevel(guildId: string, userId: string) {
  'use cache';

  cacheTag(`xp:${guildId}:${userId}`);
  cacheLife('1h');

  const level = await LevelingModule.getLevel(guildId, userId);

  if (!level) return null;

  const rank = (await LevelingModule.getRank(guildId, userId)) ?? 0;

  return { level, rank };
}

async function createRankCard(
  levelingData: {
    level: { xp: number; level: number };
    rank: number;
  },
  target: User,
) {
  const { level, rank } = levelingData;

  const card = new RankCardBuilder()
    .setAvatar(
      target.displayAvatarURL({
        forceStatic: true,
        extension: 'png',
        size: 512,
      }),
    )
    .setCurrentXP(level.xp)
    .setRequiredXP(LevelingModule.calculateLevelXP(level.level))
    .setLevel(level.level)
    .setRank(rank)
    .setUsername(target.username)
    .setDisplayName(target.globalName ?? target.username)
    .setStatus('none')
    .setOverlay(90)
    .setBackground('#23272a')
    .setGraphemeProvider(BuiltInGraphemeProvider.Twemoji);

  const image = await card.build({
    format: 'webp',
  });

  const attachment = new AttachmentBuilder(image, {
    name: `rank-${target.id}.webp`,
    description: `Rank card for ${target.username}`,
  });

  return attachment;
}

export async function getRankCard(guildId: string, user: User) {
  const userId = user.id;

  const levelingData = await fetchLevel(guildId, userId);

  if (!levelingData) {
    return null;
  }

  const attachment = await createRankCard(levelingData, user);

  return attachment;
}
