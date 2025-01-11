export const CommandKitErrorCodes = {
  GuildOnlyException: Symbol('kGuildOnlyException'),
  DMOnlyException: Symbol('kDMOnlyException'),
  CacheHit: Symbol('kCacheHit'),
} as const;

export function isCommandKitError(
  error: unknown,
): error is Error & { code: symbol } {
  if (!(error instanceof Error)) return false;
  const code = Reflect.get(error, 'code');

  for (const key in CommandKitErrorCodes) {
    if (CommandKitErrorCodes[key as keyof typeof CommandKitErrorCodes] === code)
      return true;
  }

  return false;
}
