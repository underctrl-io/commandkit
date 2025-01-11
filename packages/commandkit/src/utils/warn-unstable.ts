import colors from './colors';

const WARNED_KEYS = new Set<string>();

export function warnUnstable(name: string) {
  if (WARNED_KEYS.has(name)) return;

  WARNED_KEYS.add(name);

  process.emitWarning(
    `${name} is unstable and may change in future versions.`,
    {
      code: 'CommandKitUnstableWarning',
    },
  );
}
