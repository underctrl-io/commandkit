import EventEmitter from 'node:events';
import type { CommandKit } from '../commandkit';
import type { AsyncFunction, GenericFunction } from '../context/async-context';

/**
 * The function type for event listeners.
 */
export type ListenerFunction = GenericFunction | AsyncFunction;

/**
 * Represents a channel for emitting and listening to events in CommandKit.
 * This class provides methods to manage event listeners and emit events
 * within a specific namespace.
 */
export class CommandKitEventsChannel {
  private emitter = new EventEmitter();

  /**
   * Creates a new instance of CommandKitEventsChannel.
   * @param commandkit The CommandKit instance that this channel belongs to.
   */
  public constructor(public readonly commandkit: CommandKit) {}

  /**
   * Creates a namespaced event channel. This allows you to manage events
   * within a specific namespace, preventing conflicts with other event channels.
   * This is useful for organizing events related to different parts of your application.
   * @param namespace The namespace for the event channel.
   * @returns An object containing methods for managing events within the namespace.
   * @example commandkit.events.to('customNamespace').emit('eventName', data);
   */
  public to(namespace: string) {
    return {
      on: this.on.bind(this, namespace),
      off: this.off.bind(this, namespace),
      once: this.once.bind(this, namespace),
      emit: this.emit.bind(this, namespace),
      removeAllListeners: this.removeAllListeners.bind(this, namespace),
    };
  }

  /**
   * Register an event listener for a specific event within the namespace.
   * @param namespace The namespace for the event channel.
   * @param event The name of the event to listen for.
   * @param listener The function to call when the event is emitted.
   */
  public on(namespace: string, event: string, listener: ListenerFunction) {
    this.emitter.on(`${namespace}:${event}`, listener);
  }

  /**
   * Unregister an event listener for a specific event within the namespace.
   * @param namespace The namespace for the event channel.
   * @param event The name of the event to stop listening for.
   * @param listener The function that was registered as the listener.
   */
  public off(namespace: string, event: string, listener: ListenerFunction) {
    this.emitter.off(`${namespace}:${event}`, listener);
  }

  /**
   * Register an event listener that will be called only once for a specific event
   * within the namespace.
   * @param namespace The namespace for the event channel.
   * @param event The name of the event to listen for.
   * @param listener The function to call when the event is emitted.
   */
  public once(namespace: string, event: string, listener: ListenerFunction) {
    this.emitter.once(`${namespace}:${event}`, listener);
  }

  /**
   * Emit an event within the specified namespace, calling all registered listeners.
   * @param namespace The namespace for the event channel.
   * @param event The name of the event to emit.
   * @param args The arguments to pass to the listeners.
   * @returns A boolean indicating whether any listeners were called.
   */
  public emit(namespace: string, event: string, ...args: any[]) {
    return this.emitter.emit(`${namespace}:${event}`, ...args);
  }

  /**
   * Remove all listeners for a specific event or all events within the namespace.
   * @param namespace The namespace for the event channel.
   * @param event The name of the event to remove listeners for. If not provided, all listeners for all events in the namespace will be removed.
   */
  public removeAllListeners(namespace: string): void;
  public removeAllListeners(namespace: string, event: string): void;
  public removeAllListeners(namespace: string, event?: string): void {
    if (event) {
      this.emitter.removeAllListeners(`${namespace}:${event}`);
    } else {
      this.emitter.removeAllListeners(namespace);
    }
  }
}
