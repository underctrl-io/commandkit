import type { CommandKit } from '../CommandKit';
import { Logger } from '../logger/Logger';
import { COMMANDKIT_IS_DEV } from './constants';

const EVENT_PATTERN = /^COMMANDKIT_EVENT=(\w+)(\|(.+))?$/;

export function registerDevHooks(commandkit: CommandKit) {
  if (!COMMANDKIT_IS_DEV) return;

  process.stdin.on('data', (chunk) => {
    const input = chunk.toString().trim();

    const match = input.match(EVENT_PATTERN);

    console.log({ match });

    if (!match) return;

    const [, event, , path] = match;

    void path;

    Logger.info(`Received HMR event: ${event}${path ? ` for ${path}` : ''}`);

    // TODO: Implement reload logic

    switch (event) {
      case 'reload-commands':
        commandkit.commandHandler.reloadCommands();
        break;
      case 'reload-events':
        commandkit.eventHandler.reloadEvents();
        break;
      case 'reload-locales':
        commandkit.commandHandler.reloadCommands();
    }
  });
}
