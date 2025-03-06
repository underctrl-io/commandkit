import { CommandKit } from '../../CommandKit';
import { Logger } from '../../logger/Logger';
import { toFileURL } from '../../utils/resolve-file-url';
import { ParsedEvent } from '../router';

export type EventListener = (...args: any[]) => any;

export interface LoadedEvent {
  name: string;
  namespace: string | null;
  event: ParsedEvent;
  listeners: EventListener[];
  mainListener?: EventListener;
}

export class AppEventsHandler {
  private loadedEvents = new Map<string, LoadedEvent>();
  public constructor(public readonly commandkit: CommandKit) {}

  public async reloadEvents() {
    this.unregisterAll();
    await this.loadEvents();
  }

  public async loadEvents() {
    const router = this.commandkit.eventsRouter;

    const events = await router.scan();

    for (const event of Object.values(events)) {
      const listeners: EventListener[] = [];

      for (const listener of event.listeners) {
        const handler = await import(toFileURL(listener, true));

        if (!handler.default || typeof handler.default !== 'function') {
          Logger.error(
            `Event handler for ${event.event}${event.namespace ? ` of namespace ${event.namespace}` : ''} does not have a default export or is not a function`,
          );
        }

        listeners.push(handler.default);
      }

      const len = listeners.length;

      if (!len) {
        Logger.warn(
          `Event ${event.event}${event.namespace ? ` of namespace ${event.namespace}` : ''} does not have any listeners`,
        );
      }

      const key = `${event.namespace ? `${event.namespace}:` : ''}${event.event}`;

      this.loadedEvents.set(key, {
        name: event.event,
        namespace: event.namespace,
        event,
        listeners,
      });

      Logger.info(
        `✨ Loaded event ${event.event}${event.namespace ? ` of namespace ${event.namespace}` : ''} with ${len} listener${len === 1 ? '' : 's'}`,
      );
    }

    this.registerAllClientEvents();
  }

  public unregisterAll() {
    this.unregisterAllClientListeners();
    this.loadedEvents.clear();
  }

  public registerAllClientEvents() {
    const client = this.commandkit.client;

    for (const [key, data] of this.loadedEvents.entries()) {
      const { name, listeners, namespace, mainListener } = data;
      const main =
        mainListener ||
        (async (...args) => {
          for (const listener of listeners) {
            try {
              await listener(...args);
            } catch (e) {
              Logger.error(
                `Error handling event ${name}${
                  namespace ? ` of namespace ${namespace}` : ''
                }`,
                e,
              );
            }
          }
        });

      if (!mainListener) {
        this.loadedEvents.set(key, {
          ...data,
          mainListener: main,
        });
      }

      client.on(name, main);

      Logger.info(
        `🔌 Registered event ${name}${
          namespace ? ` of namespace ${namespace}` : ''
        }`,
      );
    }
  }

  public unregisterAllClientListeners() {
    const client = this.commandkit.client;

    for (const [
      key,
      { name, mainListener, namespace },
    ] of this.loadedEvents.entries()) {
      if (mainListener) {
        client.off(name, mainListener);
      } else {
        client.removeAllListeners(name);
      }

      this.loadedEvents.delete(key);

      Logger.info(
        `🗑️ Unregistered event ${name}${
          namespace ? ` of namespace ${namespace}` : ''
        }`,
      );
    }
  }
}
