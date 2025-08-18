import { revalidateTag } from '@commandkit/cache';
import type { EventHandler } from 'commandkit';
import { database } from '../../../database/store.ts';

const handler: EventHandler<'messageCreate'> = async (message) => {
  if (message.author.bot || !message.inGuild()) return;

  const key = `xp:${message.guildId}:${message.author.id}`;

  const oldXp = database.get<number>(key) ?? 0;
  const xp = Math.floor(Math.random() * 10) + 1;
  const newXp = oldXp + xp;

  database.set(key, newXp);
  await revalidateTag(key);
};

export default handler;
