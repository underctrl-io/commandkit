import { defaultConfig } from './default';
import { CommandKitConfig } from './types';
import { mergeDeep, ResolvedCommandKitConfig } from './utils';

let defined: ResolvedCommandKitConfig = defaultConfig;

/**
 * Get the defined configuration for CommandKit.
 */
export function getConfig(): ResolvedCommandKitConfig {
  return defined;
}

/**
 * Define the configuration for CommandKit.
 * @param config The configuration to use.
 */
export function defineConfig(
  config: Partial<CommandKitConfig> = {},
): ResolvedCommandKitConfig {
  defined = mergeDeep(
    config as ResolvedCommandKitConfig,
    mergeDeep({} as ResolvedCommandKitConfig, defaultConfig),
  );

  return defined;
}
