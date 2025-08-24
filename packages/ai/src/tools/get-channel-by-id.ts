import { z } from 'zod';
import { createTool } from './common';
import { Logger } from 'commandkit';

export const getChannelById = createTool({
  description: 'Get a channel by its ID.',
  name: 'getChannelById',
  inputSchema: z.object({
    channelId: z.string().describe('The ID of the channel to retrieve.'),
  }),
  async execute(ctx, params) {
    try {
      const { client } = ctx;
      const channel = await client.channels.fetch(params.channelId, {
        force: false,
        cache: true,
      });

      if (!channel) {
        return {
          error: 'Channel not found',
        };
      }

      return channel.toJSON();
    } catch (e) {
      Logger.error(e);

      return {
        error: 'Could not fetch the channel',
      };
    }
  },
});
