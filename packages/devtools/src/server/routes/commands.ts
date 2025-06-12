import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { getCommandKit } from '../store';

const app: Router = Router();

app.get('/', (req, res) => {
  const commandkit = getCommandKit();
  const commands = commandkit.commandHandler.getCommandsArray();

  const list = commands.map((command) => {
    return [
      command.command.id,
      {
        id: command.command.id,
        name: command.data.command.name,
        description: command.data.command.description,
        path: command.command.path,
        category: command.command.category,
        parentPath: command.command.parentPath,
        relativePath: command.command.relativePath,
        middlewares: command.command.middlewares,
        supportsAI: !!command.data.ai,
      },
    ];
  });

  return void res.status(200).json({
    commands: Object.fromEntries(list),
    middlewares: [],
  });
});

export { app as commandsRouter };
