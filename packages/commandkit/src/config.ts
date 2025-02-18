import type { CommandKitPlugin } from './plugins';

export interface CommandKitConfig {
  /**
   * The plugins to use with CommandKit.
   */
  plugins?: CommandKitPlugin[];
  /**
   * The compiler options to use with CommandKit.
   */
  compilerOptions?: {
    /**
     * Macro compiler configuration.
     */
    macro?: {
      /**
       * Whether to enable macro function compilation in development mode.
       * @default false
       */
      development?: boolean;
    };
    /**
     * Cached function compiler configuration.
     */
    cache?: {
      /**
       * Whether to enable caching of compiled functions in development mode.
       */
      development?: boolean;
    };
  };
  /**
   * The typescript configuration to use with CommandKit.
   */
  typescript?: {
    /**
     * Whether to ignore type checking during builds.
     */
    ignoreDuringBuilds?: boolean;
  };
  /**
   * Whether to generate static command handler data in production builds.
   */
  static?: boolean;
  /**
   * Statically define the environment variables to use.
   */
  env?: Record<string, string>;
  /**
   * The custom build directory name to use.
   * @default `.commandkit`
   */
  distDir?: string;
  /**
   * Whether or not to enable the source map generation.
   */
  sourceMap?: {
    /**
     * Whether to enable source map generation in development mode.
     */
    development?: boolean;
    /**
     * Whether to enable source map generation in production mode.
     */
    production?: boolean;
  };
  /**
   * Whether or not to enable typed locales.
   * @default true
   */
  typedLocales?: boolean;
  /**
   * Whether or not to enable the typed commands.
   * @default true
   */
  typedCommands?: boolean;
}

type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>;
};

const mergeDeep = <T extends Record<string, any>>(target: T, source: T): T => {
  const isObject = (obj: unknown) =>
    obj && typeof obj === 'object' && !Array.isArray(obj);

  const output: T = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key as keyof T] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output as T;
};

export type ResolvedCommandKitConfig = DeepRequired<CommandKitConfig>;

const defaultConfig: ResolvedCommandKitConfig = {
  plugins: [],
  compilerOptions: {
    macro: {
      development: false,
    },
    cache: {
      development: true,
    },
  },
  static: true,
  typescript: {
    ignoreDuringBuilds: false,
  },
  distDir: '.commandkit',
  env: {},
  sourceMap: {
    development: true,
    production: true,
  },
  typedCommands: true,
  typedLocales: true,
};

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
  config: Partial<CommandKitConfig>,
): ResolvedCommandKitConfig {
  defined = mergeDeep(
    config as ResolvedCommandKitConfig,
    mergeDeep({} as ResolvedCommandKitConfig, defaultConfig),
  );

  return defined;
}
