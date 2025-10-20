import { cacheTag } from '@commandkit/cache';
import { prisma } from '@/database/db';

async function fetchGuildPrefix(guildId: string) {
  'use cache';

  cacheTag(`guild_prefix:${guildId}`);

  const guild = await prisma.guild.findUnique({ where: { id: guildId } });
  return guild?.messagePrefix ?? '!';
}

export { fetchGuildPrefix };
