import EventEmitter from 'node:events';
import type { AsyncFunction } from '../cache';
import type { CommandKit } from '../CommandKit';
import type { GenericFunction } from '../context/async-context';

export type ListenerFunction = GenericFunction | AsyncFunction;

export class CommandKitEventsChannel {
  private emitter = new EventEmitter();

  public constructor(public readonly commandkit: CommandKit) {}

  public to(namespace: string) {
    return {
      on: this.on.bind(this, namespace),
      off: this.off.bind(this, namespace),
      once: this.once.bind(this, namespace),
      emit: this.emit.bind(this, namespace),
      removeAllListeners: this.removeAllListeners.bind(this, namespace),
    };
  }

  public on(namespace: string, event: string, listener: ListenerFunction) {
    this.emitter.on(`${namespace}:${event}`, listener);
  }

  public off(namespace: string, event: string, listener: ListenerFunction) {
    this.emitter.off(`${namespace}:${event}`, listener);
  }

  public once(namespace: string, event: string, listener: ListenerFunction) {
    this.emitter.once(`${namespace}:${event}`, listener);
  }

  public emit(namespace: string, event: string, ...args: any[]) {
    return this.emitter.emit(`${namespace}:${event}`, ...args);
  }

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
