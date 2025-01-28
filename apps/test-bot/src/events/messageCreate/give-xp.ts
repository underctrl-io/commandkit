import type { Message } from 'discord.js';
import { invalidate } from 'commandkit';
import { database } from '../../database/store';

export default async function (message: Message) {
  if (message.author.bot || !message.inGuild()) return;

  const key = `xp:${message.guildId}:${message.author.id}`;
  const oldXp = (await database.get(key)) ?? 0;
  const xp = Math.floor(Math.random() * 10) + 1;

  await database.set(key, oldXp + xp);

  // invalidate the cache
  await invalidate(key);
}
