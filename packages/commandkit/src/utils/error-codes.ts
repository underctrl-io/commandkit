/**
 * The error codes used by CommandKit.
 */
export const CommandKitErrorCodes = {
  /**
   * Error code for exiting middleware.
   */
  ExitMiddleware: Symbol('kExitMiddleware'),
  /**
   * Error code for forwarded commands.
   */
  ForwardedCommand: Symbol('kForwardedCommand'),
  /**
   * Error code for invalid command prefix.
   */
  InvalidCommandPrefix: Symbol('kInvalidCommandPrefix'),
  /**
   * Error code for plugin capture handle.
   */
  PluginCaptureHandle: Symbol('kPluginCaptureHandle'),
} as const;

/**
 * The type for CommandKit errors.
 */
export type CommandKitError = Error & { code: symbol };

/**
 * Creates a new CommandKit error with the specified code.
 * @param code The error code to assign to the error.
 * @returns A new CommandKit error instance.
 */
export function createCommandKitError(code: symbol): CommandKitError {
  const error = new Error() as CommandKitError;

  Reflect.set(error, 'code', code);

  return error;
}

/**
 * Checks if the given error is a CommandKit error.
 * @param error The error to check.
 * @returns True if the error is a CommandKit error, false otherwise.
 */
export function isCommandKitError(error: unknown): error is CommandKitError {
  if (!(error instanceof Error)) return false;
  const code = Reflect.get(error, 'code');

  for (const key in CommandKitErrorCodes) {
    if (CommandKitErrorCodes[key as keyof typeof CommandKitErrorCodes] === code)
      return true;
  }

  return false;
}

/**
 * Checks if the given error is of a specific CommandKit error type.
 * @param error The error to check.
 * @param code The error code or an array of error codes to check against.
 * @returns True if the error matches the specified code(s), false otherwise.
 */
export function isErrorType(error: unknown, code: symbol | symbol[]): boolean {
  if (!isCommandKitError(error)) return false;
  const errorCode = Reflect.get(error, 'code');

  if (!errorCode) return false;

  if (Array.isArray(code)) return code.includes(errorCode);

  return errorCode === code;
}
