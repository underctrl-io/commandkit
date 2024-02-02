import type { ClientOptions } from 'discord.js';

export interface CommandKitConfig {
  /**
   * The Discord client options.
   */
  clientOptions: ClientOptions;
  /**
   * The Discord bot token. Defaults to `process.env.DISCORD_TOKEN`.
   */
  token?: string;
  /**
   * Whether or not to use the watch mode. Defaults to `true`.
   */
  watch: boolean;
  /**
   * The output directory of the project. Defaults to `dist`.
   */
  outDir: string;
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

let globalConfig: Partial<CommandKitConfig> = {
  envExtra: true,
  outDir: 'dist',
  watch: true,
  clearRestartLogs: true,
  minify: false,
  sourcemap: false,
  nodeOptions: [],
  antiCrash: true,
  requirePolyfill: true,
  token: process.env.DISCORD_TOKEN,
};

export function getConfig(): CommandKitConfig {
  return globalConfig as CommandKitConfig;
}

const requiredProps = ['clientOptions'] as const;

type R = (typeof requiredProps)[number];

type PartialConfig<T extends CommandKitConfig> = Partial<Omit<T, R>> &
  Pick<T, R>;

export function defineConfig(config: PartialConfig<CommandKitConfig>) {
  for (const prop of requiredProps) {
    if (!config[prop]) {
      throw new Error(
        `[CommandKit Config] Missing required config property: ${prop}`,
      );
    }
  }

  globalConfig = {
    ...globalConfig,
    ...config,
  };

  return globalConfig;
}
