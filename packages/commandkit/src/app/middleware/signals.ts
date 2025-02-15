import {
  CommandKitErrorCodes,
  createCommandKitError,
  isCommandKitError,
} from '../../utils/error-codes';

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
