import {
  CommandKitErrorCodes,
  createCommandKitError,
  isCommandKitError,
} from '../../utils/error-codes';
import { eventWorkerContext } from '../events/EventWorkerContext';

/**
 * Cancel upcoming middleware execution.
 * If this is called inside pre-stage middleware, the next run will be the actual command, skipping all other pre-stage middlewares.
 * If this is called inside a command itself, it will skip all post-stage middlewares.
 * If this is called inside post-stage middleware, it will skip all other post-stage middlewares.
 */
export function exitMiddleware(): never {
  throw createCommandKitError(CommandKitErrorCodes.ExitMiddleware);
}

/**
 * Rethrow the error if it is a CommandKit error.
 * @param error The error to rethrow.
 * @example try {
 *    doSomething();
 * } catch(e) {
 *   // do something
 *
 *   // throw the error if it's a commandkit error
 *   rethrow(e)
 * }
 */
export function rethrow(error: unknown): void {
  if (isCommandKitError(error)) throw error;
}

/**
 * Stops current command assuming it has been redirected to another command.
 */
export function redirect(): never {
  throw createCommandKitError(CommandKitErrorCodes.ForwardedCommand);
}

/**
 * Stops event propagation. This function should be called inside an event handler
 * to prevent further event handling.
 * @example // src/app/events/messageCreate/handler.ts
 * import { stopEvents } from 'commandkit';
 *
 * export default async function messageCreateHandler() {
 *   console.log('Message created');
 *   // Stop further event propagation
 *   stopEvents();
 * }
 */
export function stopEvents(): never {
  if (!eventWorkerContext.getStore()) {
    throw new Error('stopEvents() may only be called inside an event handler');
  }

  throw createCommandKitError(CommandKitErrorCodes.StopEvents);
}
