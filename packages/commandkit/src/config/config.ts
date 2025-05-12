import { MaybeArray } from '../components';
import { CommandKitPlugin } from '../plugins';
import { defaultConfig } from './default';
import { CommandKitConfig } from './types';
import { ResolvedCommandKitConfig } from './utils';

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
  // defined = mergeDeep(
  //   config as ResolvedCommandKitConfig,
  //   mergeDeep({} as ResolvedCommandKitConfig, defaultConfig),
  // );

  defined = {
    compilerOptions: {
      macro: {
        ...defaultConfig.compilerOptions.macro,
        ...config.compilerOptions?.macro,
      },
    },
    distDir: config.distDir ?? defaultConfig.distDir,
    env: {
      ...defaultConfig.env,
      ...config.env,
    },
    esbuildPlugins: [
      ...(config.esbuildPlugins ?? []),
      ...(defaultConfig.esbuildPlugins ?? []),
    ],
    plugins: [...(config.plugins ?? []), ...(defaultConfig.plugins ?? [])].flat(
      Infinity,
    ) as MaybeArray<CommandKitPlugin[]>,
    sourceMap: {
      ...defaultConfig.sourceMap,
      ...config.sourceMap,
    },
    static: config.static ?? defaultConfig.static,
    typedCommands: config.typedCommands ?? defaultConfig.typedCommands,
    typescript: {
      ...defaultConfig.typescript,
      ...config.typescript,
    },
  };

  return defined;
}
