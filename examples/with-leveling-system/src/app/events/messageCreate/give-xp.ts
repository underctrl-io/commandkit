import type { Message } from 'discord.js';
import { randomInt } from 'node:crypto';
import { LevelingModule } from '@/modules/leveling-module';
import { revalidateTag } from '@commandkit/cache';
import { getCommandKit } from 'commandkit';
import { fetchGuildPrefix } from '@/utils/prefix-resolver';
import { isRateLimited } from '@/utils/throttle';

export default async function onMessageCreate(message: Message) {
  // ignore DMs
  if (!message.inGuild()) return;
  // ignore bot messages
  if (message.author.bot) return;

  const prefix = await fetchGuildPrefix(message.guildId);

  // ignore messages that don't start with the prefix
  if (message.content.startsWith(prefix)) return;

  const rateLimited = await isRateLimited(
    `xp_ratelimit:${message.guildId}:${message.author.id}`,
    60_000
  );

  if (rateLimited) return;

  const commandkit = getCommandKit(true);

  const isBooster = message.member?.premiumSinceTimestamp != null;

  const currentLevel = await LevelingModule.getLevel(
    message.guildId,
    message.author.id
  );

  // random xp between 1 and 30
  // boosters get random 0-10 extra xp
  const randomXP = randomInt(1, 20) + (isBooster ? randomInt(0, 10) : 0);
  const nextXP = (currentLevel?.xp ?? 0) + randomXP;

  // level up if the user has enough xp
  if (currentLevel) {
    const currentLevelXP = LevelingModule.calculateLevelXP(currentLevel.level);

    if (nextXP > currentLevelXP) {
      await LevelingModule.incrementLevel(message.guildId, message.author.id);

      // emit a custom event to notify the user
      commandkit.events
        .to('leveling')
        .emit('levelUp', message, currentLevel.level + 1);

      // revalidate the cache for the user and leaderboard
      await revalidateTag(`xp:${message.guildId}:${message.author.id}`);
      await revalidateTag(`leaderboard:${message.guildId}`);

      return;
    }
  }

  // assign xp to the user
  await LevelingModule.assignXP({
    guildId: message.guildId,
    userId: message.author.id,
    xp: nextXP,
    level: currentLevel?.level ?? 1,
  });

  // revalidate the cache for the user and leaderboard
  await revalidateTag(`xp:${message.guildId}:${message.author.id}`);
  await revalidateTag(`leaderboard:${message.guildId}`);
}
