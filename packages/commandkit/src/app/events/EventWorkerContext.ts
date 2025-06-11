import { AsyncLocalStorage } from 'node:async_hooks';
import { ParsedEvent } from '../router';
import { CommandKit } from '../../CommandKit';

/**
 * Context object containing information about the currently executing event.
 */
export interface EventWorkerContext {
  event: string;
  namespace: string | null;
  data: ParsedEvent;
  commandkit: CommandKit;
  arguments: any[];
  variables: Map<string, any>;
}

/**
 * @private
 * @internal
 */
const kEventWorker = Symbol('commandkitEventWorker');

/**
 * Async local storage for event worker context.
 */
export const eventWorkerContext = new AsyncLocalStorage<EventWorkerContext>();

/**
 * Runs a callback within an event worker context.
 * @param context - The event worker context
 * @param callback - The callback to execute
 * @returns The result of the callback
 */
export function runInEventWorkerContext<T>(
  context: EventWorkerContext,
  callback: () => T,
): T {
  Reflect.set(context, kEventWorker, true);

  return eventWorkerContext.run(context, callback);
}

/**
 * Gets the current event worker context.
 * @returns The current event worker context
 * @throws Error if no context is found
 */
export function getEventWorkerContext(): EventWorkerContext {
  const context = eventWorkerContext.getStore();

  if (!context) {
    throw new Error('Event worker context not found');
  }

  return context;
}

/**
 * Type guard to check if an object is an event worker context.
 * @param worker - The object to check
 * @returns True if the object is an event worker context
 */
export function isEventWorkerContext(
  worker: any,
): worker is EventWorkerContext {
  return worker && Reflect.get(worker, kEventWorker) === true;
}
