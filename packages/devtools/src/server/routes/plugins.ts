import { Router } from 'express';
import { getCommandKit } from '../store';

export const pluginsRouter: Router = Router();

pluginsRouter.get('/', async (req, res) => {
  const commandkit = getCommandKit();
  const plugins = commandkit.plugins.getPlugins();

  return void res.status(200).json({
    plugins: plugins.map((p) => ({
      name: p.name,
      id: p.id,
      loadedAt: p.loadedAt,
    })),
  });
});
