import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfigFileFromPath } from '../cli/common';
import { getConfig } from './config';

const CONFIG_FILE_NAMES = [
  'commandkit.config.js',
  'commandkit.config.mjs',
  'commandkit.config.cjs',
  'commandkit.config.ts',
];

function findConfigFile(cwd: string) {
  const locations = CONFIG_FILE_NAMES.map((name) => join(cwd, name));

  for (const location of locations) {
    if (existsSync(location)) {
      return {
        path: location,
        isTypeScript: /\.ts$/.test(location),
      };
    }
  }

  return null;
}

let loadedConfig: ReturnType<typeof getConfig> | null = null;

/**
 * Load the configuration file from the given entrypoint.
 * @param entrypoint The entrypoint to load the configuration file from. Defaults to the current working directory.
 */
export async function loadConfigFile(entrypoint = process.cwd()) {
  if (loadedConfig) return loadedConfig;
  const filePath = findConfigFile(entrypoint);
  if (!filePath) return getConfig();

  const config = await loadConfigFileFromPath(filePath.path);

  loadedConfig = config;

  return config;
}
