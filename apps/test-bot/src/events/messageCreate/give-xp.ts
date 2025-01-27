import type { Message } from 'discord.js';
import { unstable_invalidate as invalidate } from 'commandkit';
import { database } from '../../database/store';

export default async function (message: Message) {
  if (message.author.bot || !message.inGuild()) return;

  const oldXp =
    (await database.get(`${message.guildId}:${message.author.id}`)) ?? 0;
  const xp = Math.floor(Math.random() * 10) + 1;

  const key = `xp:${message.guildId}:${message.author.id}`;
  await database.set(key, oldXp + xp);

  // invalidate the cache
  await invalidate(key);
}
