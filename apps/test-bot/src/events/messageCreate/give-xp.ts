import type { Message } from 'discord.js';
import { unstable_revalidate as revalidate } from 'commandkit';
import { database } from '../../database/store';

export default async function (message: Message) {
  if (message.author.bot || !message.inGuild()) return;

  const oldXp =
    (await database.get(`${message.guildId}:${message.author.id}`)) ?? 0;
  const xp = Math.floor(Math.random() * 10) + 1;

  await database.set(`${message.guildId}:${message.author.id}`, oldXp + xp);

  // revalidate the cache
  await revalidate(`xp:${message.guildId}:${message.author.id}`);
}
