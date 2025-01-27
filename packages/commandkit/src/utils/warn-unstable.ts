const WARNED_KEYS = new Set<string>();

export function emitWarning(message: string, code = 'CommandKitWarning') {
  process.emitWarning(message, { code });
}

export function warnUnstable(name: string) {
  if (WARNED_KEYS.has(name)) return;

  WARNED_KEYS.add(name);

  emitWarning(
    `${name} is unstable and may change in future versions.`,
    'CommandKitUnstableWarning',
  );
}
