import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfigFileFromPath } from '../cli/common';
import { getConfig } from './config';
import { COMMANDKIT_CWD } from '../utils/constants';

const CONFIG_FILE_NAMES = [
  'commandkit.config.js',
  'commandkit.config.mjs',
  'commandkit.config.cjs',
  'commandkit.config.ts',
];

/**
 * Returns an array of possible configuration file paths based on the provided root directory.
 * @param root The root directory to search for configuration files.
 * @returns The array of possible configuration file paths.
 * @private
 */
export function getPossibleConfigPaths(root: string) {
  return CONFIG_FILE_NAMES.map((name) => join(root, name));
}

function findConfigFile(cwd: string) {
  const locations = getPossibleConfigPaths(cwd);

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
export async function loadConfigFile(entrypoint = COMMANDKIT_CWD) {
  if (loadedConfig) return loadedConfig;
  const filePath = findConfigFile(entrypoint);
  if (!filePath) return getConfig();

  const config = await loadConfigFileFromPath(filePath.path);

  loadedConfig = config;

  return config;
}
