import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { CommandKitConfig } from '../../config';

const ConfigLookupPaths = [
  // javascript
  'js',
  'cjs',
  'mjs',
];

export async function findConfigPath(relative: string) {
  for (const extension of ConfigLookupPaths) {
    const path = join(relative, `commandkit.${extension}`);
    if (existsSync(path)) return path;
  }

  return null;
}

export async function importConfig(path: string): Promise<CommandKitConfig> {
  const config = await import(`file://${path}`);
  return config?.default ?? config;
}
