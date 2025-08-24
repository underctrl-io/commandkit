import { z } from 'zod';
import { createTool } from './common';
import { Logger } from 'commandkit';

export const getGuildById = createTool({
  description: 'Get a guild by its ID.',
  name: 'getGuildById',
  inputSchema: z.object({
    guildId: z.string().describe('The ID of the guild to retrieve.'),
  }),
  async execute(ctx, params) {
    try {
      const { client } = ctx;
      const guild = await client.guilds.fetch({
        guild: params.guildId,
        force: false,
        cache: true,
      });

      if (!guild) {
        return {
          error: 'Guild not found',
        };
      }

      return {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
        memberCount: guild.approximateMemberCount ?? guild.memberCount,
      };
    } catch (e) {
      Logger.error(e);

      return {
        error: 'Could not fetch the guild',
      };
    }
  },
});
