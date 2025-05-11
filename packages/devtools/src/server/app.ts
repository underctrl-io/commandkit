import { join } from 'node:path';
import { api } from './api';
import express from 'express';
import { Server } from 'node:http';
import CommandKit from 'commandkit';
import { setCommandKit, setConfig } from './store';
import type { Client } from 'discord.js';
import cors from 'cors';

const staticDir = join(__dirname, '..', '..', 'ui');

const app = express();

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(staticDir));
app.use('/api', api);

declare module 'express' {
  interface Request {
    bot: Client;
  }
}

export async function startServer(
  port: number,
  commandkit: CommandKit,
  credential?: { username: string; password: string },
) {
  setCommandKit(commandkit);
  setConfig({ credential });
  return new Promise<Server>((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}
