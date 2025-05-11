import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { getClient, getConfig } from '../store';
import { generateToken } from '../helpers/authenticate';

const app: Router = Router();

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return void res
      .status(400)
      .json({ message: 'Missing username or password' });
  }

  const config = getConfig().credential;

  if (!config) {
    return void res.status(401).json({ message: 'Unauthorized' });
  }

  if (config.username !== username || config.password !== password) {
    return void res.status(401).json({ message: 'Unauthorized' });
  }

  const client = getClient();
  const accessToken = generateToken({ id: client.user.id });

  return void res.status(200).json({ user: client.user.toJSON(), accessToken });
});

// @ts-ignore
app.use(auth());

app.get('/@me', (req, res) => {
  const client = getClient();
  const data: any = client.user.toJSON();

  res.json({
    ...data,
    guilds: client.guilds.cache.size,
    channels: client.channels.cache.size,
    users: client.users.cache.size,
  });
});

export { app as authRouter };
