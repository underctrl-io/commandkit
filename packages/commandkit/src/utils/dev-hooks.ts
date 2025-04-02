import type { CommandKit } from '../CommandKit';
import { Logger } from '../logger/Logger';
import { COMMANDKIT_IS_DEV } from './constants';

interface IpcMessageCommand {
  event: string;
  path: string;
}

export interface CommandKitHMREvent {
  event: string;
  path: string;
  accept: () => void;
  preventDefault: () => void;
}

export function registerDevHooks(commandkit: CommandKit) {
  if (!COMMANDKIT_IS_DEV) return;

  process.on('message', async (message) => {
    if (typeof message !== 'object' || message === null) return;

    const { event, path } = message as IpcMessageCommand;
    if (!event) return;

    if (process.env.COMMANDKIT_DEBUG_HMR === 'true') {
      Logger.info(`Received HMR event: ${event}${path ? ` for ${path}` : ''}`);
    }

    let accepted = false,
      prevented = false;

    const hmrEvent: CommandKitHMREvent = {
      accept() {
        accepted = true;
      },
      preventDefault() {
        prevented = false;
      },
      path,
      event,
    };

    await commandkit.plugins.execute(async (ctx, plugin) => {
      // some plugin accepted the event
      if (accepted) return;
      await plugin.performHMR?.(ctx, hmrEvent);
    });

    // plugin took care of it
    if (prevented) return;

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
