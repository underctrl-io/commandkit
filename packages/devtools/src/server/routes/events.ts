import { Router } from 'express';
import { getCommandKit } from '../store';

export const eventsRouter: Router = Router();

eventsRouter.get('/', async (req, res) => {
  const commandkit = getCommandKit();

  const events = commandkit.eventHandler.getEvents();

  return void res.status(200).json({
    events,
  });
});
