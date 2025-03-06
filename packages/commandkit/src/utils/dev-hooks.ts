import type { CommandKit } from '../CommandKit';
import { Logger } from '../logger/Logger';
import { COMMANDKIT_IS_DEV } from './constants';

interface IpcMessageCommand {
  event: string;
  path?: string;
}

export function registerDevHooks(commandkit: CommandKit) {
  if (!COMMANDKIT_IS_DEV) return;

  process.on('message', (message) => {
    if (typeof message !== 'object' || message === null) return;

    const { event, path } = message as IpcMessageCommand;
    if (!event) return;

    if (process.env.COMMANDKIT_DEBUG_HMR === 'true') {
      Logger.info(`Received HMR event: ${event}${path ? ` for ${path}` : ''}`);
    }

    switch (event) {
      case 'reload-commands':
        commandkit.commandHandler.reloadCommands();
        break;
      case 'reload-events':
        commandkit.eventHandler.reloadEvents();
        break;
      case 'reload-locales':
        commandkit.commandHandler.reloadCommands();
        break;
    }
  });
}
