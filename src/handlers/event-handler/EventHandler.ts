import { getFilePaths, getFolderPaths } from '../../utils/get-paths';
import { EventHandlerOptions, EventHandlerData } from './typings';

export class EventHandler {
  _data: EventHandlerData;

  constructor({ ...options }: EventHandlerOptions) {
    this._data = {
      ...options,
      events: [],
    };

    this._buildEvents();
    this._registerEvents();
  }

  _buildEvents() {
    const eventFolderPaths = getFolderPaths(this._data.eventsPath);

    for (const eventFolderPath of eventFolderPaths) {
      const eventName = eventFolderPath.replace(/\\/g, '/').split('/').pop() as string;

      const eventFilePaths = getFilePaths(eventFolderPath, true).filter(
        (path) => path.endsWith('.js') || path.endsWith('.ts')
      );

      const eventObj = {
        name: eventName,
        functions: [] as Function[],
      };

      this._data.events.push(eventObj);

      for (const eventFilePath of eventFilePaths) {
        const eventFunction = require(eventFilePath);

        if (typeof eventFunction !== 'function') {
          console.log(`Ignoring: Event ${eventFilePath} does not export a function.`);
          continue;
        }

        eventObj.functions.push(eventFunction);
      }
    }
  }

  _registerEvents() {
    const client = this._data.client;

    for (const eventObj of this._data.events) {
      client.on(eventObj.name, async (...params) => {
        for (const eventFunction of eventObj.functions) {
          const stopEventLoop = await eventFunction(...params, client);

          if (stopEventLoop) {
            break;
          }
        }
      });
    }
  }

  getEvents() {
    return this._data.events;
  }
}
