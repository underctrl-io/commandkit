import { CommandKit } from '../../CommandKit';
import { ListenerFunction } from '../../events/CommandKitEventsChannel';
import { Logger } from '../../logger/Logger';
import { toFileURL } from '../../utils/resolve-file-url';
import { StopEventPropagationError } from '../../utils/utilities';
import { runInEventWorkerContext } from '../events/EventWorkerContext';
import { ParsedEvent } from '../router';

export type EventListener = {
  handler: ListenerFunction;
  once: boolean;
};

export interface LoadedEvent {
  name: string;
  namespace: string | null;
  event: ParsedEvent;
  listeners: EventListener[];
  mainListener?: EventListener;
  executedOnceListeners?: Set<ListenerFunction>; // Track executed once listeners
}

export class AppEventsHandler {
  private loadedEvents = new Map<string, LoadedEvent>();
  public constructor(public readonly commandkit: CommandKit) {}

  public async reloadEvents() {
    this.unregisterAll();
    await this.loadEvents();
  }

  public async loadEvents() {
    await this.commandkit.plugins.execute((ctx, plugin) => {
      return plugin.onBeforeEventsLoad(ctx);
    });

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

        listeners.push({
          handler: handler.default,
          once: !!handler.once,
        });
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

    await this.commandkit.plugins.execute((ctx, plugin) => {
      return plugin.onAfterEventsLoad(ctx);
    });
  }

  public unregisterAll() {
    this.unregisterAllClientListeners();
    this.loadedEvents.clear();
  }

  public registerAllClientEvents() {
    const client = this.commandkit.client;

    for (const [key, data] of this.loadedEvents.entries()) {
      const { name, listeners, namespace } = data;

      // Separate listeners into "once" and "on" groups
      const onceListeners = listeners.filter((listener) => listener.once);
      const onListeners = listeners.filter((listener) => !listener.once);

      // Initialize set to track executed once listeners
      const executedOnceListeners = new Set<ListenerFunction>();

      // Create main handler for regular "on" listeners
      const mainHandler: ListenerFunction = async (...args) => {
        await runInEventWorkerContext(
          {
            event: name,
            namespace: namespace ?? null,
            data: data.event,
            commandkit: this.commandkit,
          },
          async () => {
            for (const listener of onListeners) {
              try {
                await listener.handler(...args);
              } catch (e) {
                // Check if this is a stop propagation signal
                if (e instanceof StopEventPropagationError) {
                  Logger.debug(
                    `Event propagation stopped for ${name}${
                      namespace ? ` of namespace ${namespace}` : ''
                    }`,
                  );
                  break; // Stop executing remaining listeners
                }

                // Otherwise log the error as usual
                Logger.error(
                  `Error handling event ${name}${
                    namespace ? ` of namespace ${namespace}` : ''
                  }`,
                  e,
                );
              }
            }
          },
        );
      };

      // Create handler for "once" listeners with cleanup logic
      const onceHandler: ListenerFunction = async (...args) => {
        let broken = false;

        for (const listener of onceListeners) {
          if (broken) break; // Stop executing remaining listeners if propagation was stopped

          await runInEventWorkerContext(
            {
              event: name,
              namespace: namespace ?? null,
              data: data.event,
              commandkit: this.commandkit,
            },
            async () => {
              try {
                // Skip if already executed (shouldn't happen with proper .once registration, but just in case)
                if (executedOnceListeners.has(listener.handler)) return;

                await listener.handler(...args);
                executedOnceListeners.add(listener.handler);
              } catch (e) {
                // Check if this is a stop propagation signal
                if (e instanceof StopEventPropagationError) {
                  Logger.debug(
                    `Event propagation stopped for ${name}${
                      namespace ? ` of namespace ${namespace}` : ''
                    }`,
                  );
                  broken = true; // Stop executing remaining listeners
                }

                // Otherwise log the error as usual
                Logger.error(
                  `Error handling event ${name}${
                    namespace ? ` of namespace ${namespace}` : ''
                  }`,
                  e,
                );
              }
            },
          );
        }

        // Cleanup: Remove once listeners that have been executed
        if (
          executedOnceListeners.size === onceListeners.length &&
          onListeners.length === 0
        ) {
          // If all once listeners executed and no regular listeners, remove event entirely
          this.loadedEvents.delete(key);
          Logger.info(
            `🧹 Cleaned up completed once-only event ${name}${
              namespace ? ` of namespace ${namespace}` : ''
            }`,
          );
        }
      };

      // Store main handlers in loadedEvents for later unregistration
      this.loadedEvents.set(key, {
        ...data,
        mainListener:
          onListeners.length > 0
            ? { handler: mainHandler, once: false }
            : undefined,
        executedOnceListeners,
      });

      // Register handlers with appropriate methods
      if (namespace) {
        if (onListeners.length > 0) {
          this.commandkit.events.on(namespace, name, mainHandler);
        }
        if (onceListeners.length > 0) {
          this.commandkit.events.once(namespace, name, onceHandler);
        }
      } else {
        if (onListeners.length > 0) {
          client.on(name, mainHandler);
        }
        if (onceListeners.length > 0) {
          client.once(name, onceHandler);
        }
      }

      Logger.info(
        `🔌 Registered event ${name}${
          namespace ? ` of namespace ${namespace}` : ''
        } (${onListeners.length} regular, ${onceListeners.length} once-only)`,
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
        if (namespace) {
          this.commandkit.events.off(namespace, name, mainListener.handler);
        } else {
          client.off(name, mainListener.handler);
        }
      } else {
        if (namespace) {
          this.commandkit.events.removeAllListeners(namespace, name);
        } else {
          client.removeAllListeners(name);
        }
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
