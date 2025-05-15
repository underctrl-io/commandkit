import { Router } from 'express';
import { getCommandKit } from '../store';

export const flagsRouter: Router = Router();

flagsRouter.get('/', async (req, res) => {
  const flags = await getCommandKit().flags.map((f) => ({
    key: f.options.key,
    description: f.options.description ?? null,
    hasIdentify: f.options.identify !== undefined,
  }));

  return void res.status(200).json({
    flags,
  });
});
