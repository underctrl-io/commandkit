import { z } from 'zod';
import { createTool } from './common';
import { Logger } from 'commandkit';

export const getUserById = createTool({
  description: 'Get a user by their ID.',
  name: 'getUserById',
  inputSchema: z.object({
    userId: z.string().describe('The ID of the user to retrieve.'),
  }),
  async execute(ctx, params) {
    try {
      const { client } = ctx;
      const user = await client.users.fetch(params.userId, {
        force: false,
        cache: true,
      });

      return user.toJSON();
    } catch (e) {
      Logger.error(e);

      return {
        error: 'Could not fetch the user',
      };
    }
  },
});
