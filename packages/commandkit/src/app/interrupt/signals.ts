import {
  CommandKitErrorCodes,
  createCommandKitError,
  isCommandKitError,
} from '../../utils/error-codes';
import { eventWorkerContext } from '../events/EventWorkerContext';

/**
 * Stop upcoming middlewares and command execution.
 */
export function stopMiddlewares(): never {
  throw createCommandKitError(CommandKitErrorCodes.StopMiddlewares);
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
