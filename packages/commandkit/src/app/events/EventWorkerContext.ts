import { AsyncLocalStorage } from 'node:async_hooks';
import { ParsedEvent } from '../router';
import { CommandKit } from '../../CommandKit';

export interface EventWorkerContext {
  event: string;
  namespace: string | null;
  data: ParsedEvent;
  commandkit: CommandKit;
  arguments: any[];
  variables: Map<string, any>;
}

const kEventWorker = Symbol('commandkitEventWorker');

export const eventWorkerContext = new AsyncLocalStorage<EventWorkerContext>();

export function runInEventWorkerContext<T>(
  context: EventWorkerContext,
  callback: () => T,
): T {
  Reflect.set(context, kEventWorker, true);

  return eventWorkerContext.run(context, callback);
}

export function getEventWorkerContext(): EventWorkerContext {
  const context = eventWorkerContext.getStore();

  if (!context) {
    throw new Error('Event worker context not found');
  }

  return context;
}

export function isEventWorkerContext(
  worker: any,
): worker is EventWorkerContext {
  return worker && Reflect.get(worker, kEventWorker) === true;
}
