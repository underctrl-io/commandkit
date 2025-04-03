import { CachePlugin } from '../plugins/runtime/builtin/cache/CachePlugin';
import { MacroPlugin } from '../plugins/runtime/builtin/MacroPlugin';
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
    ignoreDuringBuilds: false,
  },
  distDir: 'dist',
  env: {},
  sourceMap: {
    development: true,
    production: true,
  },
  typedCommands: true,
};
