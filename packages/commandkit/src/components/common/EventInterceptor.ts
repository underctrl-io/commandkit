import { Awaitable, Client, ClientEvents, Events } from 'discord.js';

export interface EventInterceptorContextData<E extends keyof ClientEvents> {
  /**
   * The filter to use for the collector.
   */
  filter?: (...args: ClientEvents[E]) => Awaitable<boolean>;
  /**
   * The duration (in ms) that the collector should run for.
   */
  time?: number;
  /**
   * If the collector should automatically reset the timer when a button is clicked.
   */
  autoReset?: boolean;
  /**
   * Whether the collector should run only once.
   */
  once?: boolean;
  /**
   * The handler to run when the collector ends.
   */
  onEnd?: (reason: string) => Awaitable<void>;
  /**
   * The handler to run upon an error.
   */
  onError?: EventInterceptorErrorHandler;
}

export type EventInterceptorErrorHandler = (error: Error) => Awaitable<void>;

export class EventInterceptor {
  private subscribers = new Map<
    keyof ClientEvents,
    Set<(...args: any[]) => void>
  >();
  private globalHandlers = new Map<
    keyof ClientEvents,
    (...args: any[]) => void
  >();
  private cleanupTimer: NodeJS.Timeout | null = null;

  /**
   * Creates the event interceptor.
   */
  public constructor(public readonly client: Client) {
    this.#cleanupLoop();
  }

  #cleanupLoop() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);

    this.cleanupTimer = setInterval(() => {
      for (const [event, handlers] of this.subscribers) {
        for (const handler of handlers) {
          const options = Reflect.get(
            handler,
            'options',
          ) as EventInterceptorContextData<keyof ClientEvents> & {
            registeredAt: number;
          };

          const isExpired =
            options.time && Date.now() - options.registeredAt > options.time;

          if (isExpired) {
            this.unsubscribe(event, handler, 'time');
          }
        }
      }
    }, 60_000).unref();
  }

  /**
   * Destroys the event interceptor.
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    for (const [event, handlers] of this.subscribers) {
      for (const handler of handlers) {
        this.unsubscribe(event, handler, 'destroy');
      }
    }

    this.subscribers.clear();
    this.globalHandlers.clear();
  }

  /**
   * Whether the event has subscribers.
   * @param event The event to check.
   */
  public hasSubscribers(event: keyof ClientEvents): boolean {
    return this.subscribers.has(event);
  }

  /**
   * Returns the number of subscribers for the event.
   * @param event The event to check.
   */
  public getSubscriberCount(event: keyof ClientEvents): number {
    const handlers = this.subscribers.get(event);
    return handlers?.size ?? 0;
  }

  /**
   * Whether the event has global handlers.
   */
  public hasGlobalHandlers(): boolean {
    return this.globalHandlers.size > 0;
  }

  /**
   * Returns the number of global handlers.
   */
  public getGlobalHandlersCount(): number {
    return this.subscribers.size;
  }

  /**
   * Subscribes to an event.
   * @param event The event to subscribe to.
   * @param listener The listener to call when the event is emitted.
   * @returns A function to unsubscribe from the event.
   */
  public subscribe<Event extends keyof ClientEvents>(
    event: Event,
    listener: (...args: ClientEvents[Event]) => void,
    options?: EventInterceptorContextData<Event>,
  ): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
      this.client.on(event, this.createGlobalHandler(event));
      this.client.setMaxListeners(this.client.getMaxListeners() + 1);
    }

    options ??= {};

    // @ts-ignore
    options.registeredAt = Date.now();

    Reflect.set(listener, 'options', options);

    this.subscribers.get(event)!.add(listener);

    return () => {
      this.unsubscribe(event, listener);
    };
  }

  /**
   * Unsubscribes from an event.
   * @param event The event to unsubscribe from.
   */
  public unsubscribe<Event extends keyof ClientEvents>(
    event: Event,
    listener: (...args: ClientEvents[Event]) => void,
    reason?: string,
  ): void {
    const handlers = this.subscribers.get(event);
    if (!handlers) return;

    handlers.delete(listener);

    if (handlers.size < 1) {
      this.subscribers.delete(event);
      this.client.removeListener(event, this.globalHandlers.get(event)!);
      this.globalHandlers.delete(event);
      this.client.setMaxListeners(
        Math.max(this.client.getMaxListeners() - 1, 0),
      );
    }

    Reflect.get(listener, 'options').onEnd?.(reason ?? 'unsubscribe');
  }

  /**
   * Creates a global handler for the event.
   * @param event The event to create a global handler for.
   * @returns The global handler.
   */
  private createGlobalHandler<Event extends keyof ClientEvents>(
    event: Event,
  ): (...args: ClientEvents[Event]) => void {
    if (this.globalHandlers.has(event)) {
      return this.globalHandlers.get(event)!;
    }

    const handler = async (...args: ClientEvents[Event]) => {
      const subscribers = this.subscribers.get(event);
      if (subscribers && subscribers.size > 0) {
        for (const subscriber of subscribers) {
          const options = Reflect.get(
            subscriber,
            'options',
          ) as EventInterceptorContextData<Event> & { registeredAt: number };

          const isExpired =
            options.time && Date.now() - options.registeredAt > options.time;

          if (isExpired) {
            this.unsubscribe(event, subscriber, 'time');
            continue;
          }

          if (options.autoReset) {
            options.registeredAt = Date.now();
          }

          if (options.filter && !(await options.filter(...args))) {
            continue;
          }

          try {
            await subscriber(...args);
          } catch (e) {
            if (options.onError) {
              await options.onError(<Error>e);
            } else {
              throw e;
            }
          } finally {
            if (options.once) {
              this.unsubscribe(event, subscriber, 'once');
            }
          }
        }
      }
    };

    this.globalHandlers.set(event, handler);

    return handler;
  }
}
