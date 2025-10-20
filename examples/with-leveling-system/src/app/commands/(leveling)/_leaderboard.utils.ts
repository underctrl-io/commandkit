import {
  ImageSource,
  LeaderboardBuilder,
  LeaderboardVariants,
} from 'canvacord';
import { AttachmentBuilder, Guild } from 'discord.js';
import { LevelingModule } from '@/modules/leveling-module';
import { useClient } from 'commandkit/hooks';
import { cacheTag } from '@commandkit/cache';

async function fetchLeaderboard(guildId: string) {
  'use cache';

  cacheTag(`leaderboard:${guildId}`);

  const client = useClient();

  const leaderboard = await LevelingModule.computeLeaderboard(guildId);
  const total = await LevelingModule.countEntries(guildId);

  const players: {
    displayName: string;
    username: string;
    level: number;
    xp: number;
    rank: number;
    avatar: ImageSource;
  }[] = [];

  let rank = 1;

  for (const entry of leaderboard) {
    const user = await client.users.fetch(entry.id).catch(() => null);

    if (!user) {
      players.push({
        displayName: `Unknown User ${rank}`,
        username: 'unknown-user',
        level: entry.level,
        xp: entry.xp,
        rank: rank++,
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
      });

      continue;
    }

    players.push({
      displayName: user.username,
      username: user.username,
      level: entry.level,
      xp: entry.xp,
      rank: rank++,
      avatar: user.displayAvatarURL({
        forceStatic: true,
        extension: 'png',
        size: 512,
      }),
    });
  }

  return { players, total };
}

async function createLeaderboardCard(data: {
  leaderboard: Awaited<ReturnType<typeof fetchLeaderboard>>;
  guildName: string;
  guildIcon: string | null;
}) {
  const card = new LeaderboardBuilder()
    .setVariant(LeaderboardVariants.Horizontal)
    .setHeader({
      image: data.guildIcon ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
      subtitle: `Total ${data.leaderboard.total} players`,
      title: data.guildName,
    })
    .setBackground('./assets/deer.jpg')
    .setPlayers(data.leaderboard.players);

  const image = await card.build({
    format: 'webp',
  });

  const attachment = new AttachmentBuilder(image, {
    name: `leaderboard-${data.guildName.replace(/ /g, '-')}.webp`,
    description: `Leaderboard for ${data.guildName}`,
  });

  return attachment;
}

export async function getLeaderboardCard(guild: Guild) {
  const leaderboard = await fetchLeaderboard(guild.id);

  if (!leaderboard.players.length) return null;

  const card = await createLeaderboardCard({
    leaderboard,
    guildName: guild!.name,
    guildIcon: guild!.iconURL({
      forceStatic: true,
      extension: 'png',
      size: 512,
    }),
  });

  return card;
}
