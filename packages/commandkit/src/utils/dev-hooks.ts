import type { CommandKit } from '../CommandKit';
import { Logger } from '../logger/Logger';
import { COMMANDKIT_IS_DEV, HMREventType } from './constants';

interface IpcMessageCommand {
  event: HMREventType;
  path: string;
  id?: string;
}

export interface CommandKitHMREvent {
  event: HMREventType;
  path: string;
  accept: () => void;
  preventDefault: () => void;
}

export function registerDevHooks(commandkit: CommandKit) {
  if (!COMMANDKIT_IS_DEV) return;

  process.on('message', async (message) => {
    if (typeof message !== 'object' || message === null) return;

    const { event, path, id } = message as IpcMessageCommand;
    if (!event) return;

    if (process.env.COMMANDKIT_DEBUG_HMR === 'true') {
      Logger.info(`Received HMR event: ${event}${path ? ` for ${path}` : ''}`);
    }

    let accepted = false,
      prevented = false,
      handled = false;

    const hmrEvent: CommandKitHMREvent = {
      accept() {
        accepted = true;
      },
      preventDefault() {
        prevented = true;
      },
      path,
      event,
    };

    try {
      await commandkit.plugins.execute(async (ctx, plugin) => {
        // some plugin accepted the event
        if (accepted) return;
        await plugin.performHMR?.(ctx, hmrEvent);
      });

      // plugin took care of it
      if (prevented) return;

      switch (event) {
        case HMREventType.ReloadCommands:
          commandkit.commandHandler.reloadCommands();
          handled = true;
          break;
        case HMREventType.ReloadEvents:
          commandkit.eventHandler.reloadEvents();
          handled = true;
          break;
        case HMREventType.Unknown:
          // Handle unknown events if needed
          handled = false;
          break;
        default:
          // invalid hmr event
          break;
      }
    } finally {
      // Send acknowledgment back to dev server if an id was provided
      if (id && process.send) {
        process.send({
          type: 'commandkit-hmr-ack',
          id,
          handled: handled || accepted,
        });
      }
    }
  });
}
