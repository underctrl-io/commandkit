import { CachePlugin } from '../plugins/plugin-runtime/builtin/CachePlugin';
import { MacroPlugin } from '../plugins/plugin-runtime/builtin/MacroPlugin';
import { ResolvedCommandKitConfig } from './utils';

export const defaultConfig: ResolvedCommandKitConfig = {
  plugins: [
    new CachePlugin({ enabled: true }),
    new MacroPlugin({ enabled: true }),
  ],
  esbuildPlugins: [],
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
    ignoreBuildErrors: false,
  },
  distDir: 'dist',
  env: {},
  sourceMap: {
    development: true,
    production: true,
  },
  typedCommands: true,
};
