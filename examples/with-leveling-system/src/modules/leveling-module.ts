import { prisma } from '@/database/db';

export interface AssignXPInput {
  guildId: string;
  userId: string;
  xp: number;
  level: number;
}

export class LevelingModule extends null {
  public static async ensureGuild(guildId: string) {
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (guild) return guild;

    const entity = await prisma.guild.create({
      data: {
        id: guildId,
      },
    });

    return entity;
  }

  public static async assignXP(input: AssignXPInput) {
    const { guildId, userId, xp, level } = input;
    const guild = await this.ensureGuild(guildId);

    const updated = await prisma.level.upsert({
      where: {
        id_guildId: {
          id: userId,
          guildId: guild.id,
        },
      },
      create: {
        id: userId,
        guildId: guild.id,
        xp,
        level,
      },
      update: {
        xp: {
          increment: xp,
        },
        level,
      },
    });

    return updated;
  }

  public static async incrementLevel(guildId: string, userId: string) {
    const guild = await this.ensureGuild(guildId);
    const level = await prisma.level.upsert({
      where: {
        id_guildId: {
          id: userId,
          guildId: guild.id,
        },
      },
      create: {
        id: userId,
        guildId: guild.id,
        xp: 0,
        level: 1,
      },
      update: {
        level: {
          increment: 1,
        },
        xp: 0,
      },
    });

    return level;
  }

  public static async getLevel(guildId: string, userId: string) {
    const guild = await this.ensureGuild(guildId);

    const level = await prisma.level.findUnique({
      where: {
        id_guildId: {
          id: userId,
          guildId: guild.id,
        },
      },
    });

    return level;
  }

  public static async getRank(guildId: string, userId: string) {
    // rank = index of user in leaderboard ordered by DESC xp
    const rank: [{ rank?: bigint }] = await prisma.$queryRaw`
    SELECT rank FROM (
      SELECT
        "id",
        "guildId",
        ROW_NUMBER() OVER (PARTITION BY "guildId" ORDER BY "level" DESC, "xp" DESC) AS rank
      FROM "Level"
    ) AS ranked
    WHERE "id" = ${userId} AND "guildId" = ${guildId}`;

    const val = rank?.[0]?.rank;

    return Number(val ?? 0);
  }

  public static async computeLeaderboard(guildId: string) {
    const guild = await this.ensureGuild(guildId);

    const leaderboard = await prisma.level.findMany({
      where: {
        guildId: guild.id,
      },
      orderBy: {
        xp: 'desc',
      },
      take: 10,
    });

    return leaderboard;
  }

  public static async countEntries(guildId: string) {
    return prisma.level.count({
      where: {
        guildId,
      },
    });
  }

  public static calculateLevelXP(level: number) {
    // 100 * (level ^ 2) + 100 * level
    return 100 * Math.pow(level, 2) + 100 * level;
  }
}
