export const CommandKitErrorCodes = {
  GuildOnlyException: Symbol('kGuildOnlyException'),
  DMOnlyException: Symbol('kDMOnlyException'),
  ExitMiddleware: Symbol('kExitMiddleware'),
  ForwardedCommand: Symbol('kForwardedCommand'),
  InvalidCommandPrefix: Symbol('kInvalidCommandPrefix'),
  PluginCaptureHandle: Symbol('kPluginCaptureHandle'),
} as const;

export type CommandKitError = Error & { code: symbol };

export function createCommandKitError(code: symbol): CommandKitError {
  const error = new Error() as CommandKitError;

  Reflect.set(error, 'code', code);

  return error;
}

export function isCommandKitError(error: unknown): error is CommandKitError {
  if (!(error instanceof Error)) return false;
  const code = Reflect.get(error, 'code');

  for (const key in CommandKitErrorCodes) {
    if (CommandKitErrorCodes[key as keyof typeof CommandKitErrorCodes] === code)
      return true;
  }

  return false;
}

export function isErrorType(error: unknown, code: symbol | symbol[]): boolean {
  if (!isCommandKitError(error)) return false;
  const errorCode = Reflect.get(error, 'code');

  if (!errorCode) return false;

  if (Array.isArray(code)) return code.includes(errorCode);

  return errorCode === code;
}
