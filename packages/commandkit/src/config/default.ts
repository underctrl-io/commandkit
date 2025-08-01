import { MacroPlugin } from '../plugins/plugin-runtime/builtin/MacroPlugin';
import { ResolvedCommandKitConfig } from './utils';
import json from '@rollup/plugin-json';

/**
 * Default configuration for CommandKit.
 */
export const defaultConfig: ResolvedCommandKitConfig = {
  plugins: [new MacroPlugin({ enabled: true })],
  rolldownPlugins: [json() as any],
  compilerOptions: {
    macro: {
      development: false,
    },
  },
  static: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  distDir: 'dist',
  env: {},
  sourceMap: {
    development: true,
    production: true,
  },
  typedCommands: true,
  disablePrefixCommands: false,
  showUnknownPrefixCommandsWarning: true,
};
