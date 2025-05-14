import { join } from 'node:path';
import { api } from './api';
import express from 'express';
import { Server } from 'node:http';
import CommandKit, { Logger } from 'commandkit';
import { setCommandKit, setConfig } from './store';
import cors from 'cors';

const staticDir = join(__dirname, '..', '..', 'ui');

const app = express();

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(staticDir));
app.use('/api', api);

export async function startServer(
  port: number,
  commandkit: CommandKit,
  credential?: { username: string; password: string },
) {
  setCommandKit(commandkit);
  setConfig({ credential });

  let currentPort = port;
  const maxRetries = 10; // Limit the number of retries to prevent infinite loop
  let retries = 0;

  return new Promise<Server>((resolve, reject) => {
    function attemptToListen() {
      try {
        const server = app.listen(currentPort, () => {
          resolve(server);
        });

        server.on('error', (error: NodeJS.ErrnoException) => {
          // Handle specific error for port already in use
          if (error.code === 'EADDRINUSE' && retries < maxRetries) {
            Logger.warn(
              `Port ${currentPort} is already in use, trying port ${currentPort + 1}`,
            );
            currentPort++;
            retries++;
            attemptToListen();
          } else {
            // For other errors or if we've exceeded max retries
            Logger.error('Server failed to start:', error);
            reject(error);
          }
        });
      } catch (error) {
        Logger.error('Unexpected error starting server:', error);
        reject(error);
      }
    }

    attemptToListen();
  });
}
