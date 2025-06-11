import { z } from 'zod';
import { createTool } from './common';

export const getCurrentClientInfo = createTool({
  name: 'getCurrentClientInfo',
  description: 'Get information about the current discord bot user',
  parameters: z.object({}),
  execute: async (ctx, params) => {
    const { client } = ctx;
    const user = client.user;

    if (!user) {
      return {
        error: 'Bot user not found',
      };
    }

    return user.toJSON();
  },
});
