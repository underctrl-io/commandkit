import { MaybeArray } from '../components';
import { CommandKitPlugin } from '../plugins';

export interface CommandKitConfig {
  /**
   * The plugins to use with CommandKit.
   * Can be a single plugin, an array of plugins, or a nested array of plugins.
   */
  plugins?: MaybeArray<CommandKitPlugin>[] | Array<CommandKitPlugin>;
  /**
   * The rolldown plugins to use with CommandKit.
   */
  rolldownPlugins?: any[];
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
  };
  /**
   * The typescript configuration to use with CommandKit.
   */
  typescript?: {
    /**
     * Whether to ignore type checking during builds.
     */
    ignoreBuildErrors?: boolean;
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
   * @default `dist`
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
   * Whether or not to enable the typed commands.
   * @default true
   */
  typedCommands?: boolean;
}
