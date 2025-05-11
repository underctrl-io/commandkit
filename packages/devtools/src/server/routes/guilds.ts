import { Router } from 'express';
import { getClient } from '../store';

export const guildsRouter: Router = Router();

guildsRouter.get('/', async (req, res) => {
  const guilds = await getClient().guilds.cache.toJSON();

  return void res.status(200).json({
    guilds,
  });
});
