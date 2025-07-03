import type { Message } from 'discord.js';
import { database } from '../../../database/store.ts';
import { revalidateTag } from '@commandkit/cache';

export default async function (message: Message) {
  if (message.author.bot || !message.inGuild()) return;

  const key = `xp:${message.guildId}:${message.author.id}`;

  const oldXp = database.get<number>(key) ?? 0;
  const xp = Math.floor(Math.random() * 10) + 1;
  const newXp = oldXp + xp;

  database.set(key, newXp);
  await revalidateTag(key);
}
