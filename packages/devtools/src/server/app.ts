import { join } from 'node:path';
import { api } from './api';
import express from 'express';
import { Server } from 'node:http';
import CommandKit from 'commandkit';
import { setCommandKit } from './store';

const staticDir = join(__dirname, '..', '..', 'ui');

const app = express();

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(staticDir));
app.use('/api', api);

export async function startServer(port: number, commandkit: CommandKit) {
  setCommandKit(commandkit);
  return new Promise<Server>((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}
