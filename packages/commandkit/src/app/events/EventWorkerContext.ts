import { AsyncLocalStorage } from 'node:async_hooks';
import { ParsedEvent } from '../router';
import { CommandKit } from '../../CommandKit';

export interface EventWorkerContext {
  event: string;
  namespace: string | null;
  data: ParsedEvent;
  commandkit: CommandKit;
}

export const eventWorkerContext = new AsyncLocalStorage<EventWorkerContext>();

export function runInEventWorkerContext<T>(
  context: EventWorkerContext,
  callback: () => T,
): T {
  return eventWorkerContext.run(context, callback);
}

export function getEventWorkerContext(): EventWorkerContext {
  const context = eventWorkerContext.getStore();

  if (!context) {
    throw new Error('Event worker context not found');
  }

  return context;
}
