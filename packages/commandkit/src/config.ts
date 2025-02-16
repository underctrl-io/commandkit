export interface CommandKitConfig {
  /**
   * The output directory of the project. Defaults to `dist`.
   */
  outDir: string;
  /**
   * Whether or not to use the watch mode. Defaults to `true`.
   */
  watch: boolean;
  /**
   * Whether or not to include extra env utilities. Defaults to `true`.
   */
  envExtra: boolean;
  /**
   * Node.js cli options.
   */
  nodeOptions: string[];
  /**
   * Whether or not to clear default restart logs. Defaults to `true`.
   */
  clearRestartLogs: boolean;
  /**
   * Whether or not to minify the output. Defaults to `false`.
   */
  minify: boolean;
  /**
   * Whether or not to include sourcemaps in production build. Defaults to `false`.
   */
  sourcemap: boolean | 'inline';
  /**
   * Whether or not to include anti-crash handler in production. Defaults to `true`.
   */
  antiCrash: boolean;
  /**
   * Whether or not to polyfill `require` function. Defaults to `true`.
   */
  requirePolyfill: boolean;
}

const defaultConfig: CommandKitConfig = {
  outDir: 'dist',
  watch: true,
  envExtra: true,
  nodeOptions: [],
  clearRestartLogs: true,
  minify: false,
  sourcemap: false,
  antiCrash: true,
  requirePolyfill: true,
};

export function getConfig(): CommandKitConfig {
  return defaultConfig;
}

export function defineConfig(config: Partial<CommandKitConfig>) {
  return { ...defaultConfig, ...config };
}
