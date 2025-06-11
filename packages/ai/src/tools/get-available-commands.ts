import { z } from 'zod';
import { createTool } from './common';

export const getAvailableCommands = createTool({
  description: 'Get a list of all available commands.',
  name: 'getAvailableCommands',
  parameters: z.object({}),
  execute(ctx, params) {
    const { commandkit } = ctx;

    const commands = commandkit.commandHandler
      .getCommandsArray()
      .map((cmd) => ({
        name: cmd.data.command.name,
        description: cmd.data.command.description,
        category: cmd.command.category,
        supportsAI: 'ai' in cmd.data && typeof cmd.data.ai === 'function',
      }));

    return commands;
  },
});
