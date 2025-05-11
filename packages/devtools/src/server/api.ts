import { Router } from 'express';
import { authRouter } from './routes/auth';
import { commandsRouter } from './routes/commands';
import { auth } from './middlewares/auth.middleware';
import { guildsRouter } from './routes/guilds';

export const api: Router = Router();

api.get('/', (req, res) => {
  res.json({
    message: 'Hello from CommandKit Devtools API',
  });
});

api.use('/auth', authRouter);
// @ts-ignore
api.use(auth());
api.use('/commands', commandsRouter);
api.use('/guilds', guildsRouter);
