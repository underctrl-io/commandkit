const WARNED_KEYS = new Set<string>();

/**
 * Emit a warning message to the console as a CommandKitWarning.
 * @param message - The warning message to emit.
 * @param code - The warning code (default is 'CommandKitWarning').
 */
export function emitWarning(message: string, code = 'CommandKitWarning') {
  process.emitWarning(message, { code });
}

/**
 * Emit a warning for unstable features in CommandKit.
 * @param name - The name of the unstable feature.
 * @example warnUnstable('MyUnstableFeature');
 */
export function warnUnstable(name: string) {
  if (WARNED_KEYS.has(name)) return;

  WARNED_KEYS.add(name);

  emitWarning(
    `${name} is unstable and may change in future versions.`,
    'CommandKitUnstableWarning',
  );
}
