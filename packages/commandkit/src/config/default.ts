import { MacroPlugin } from '../plugins/plugin-runtime/builtin/MacroPlugin';
import { ResolvedCommandKitConfig } from './utils';

export const defaultConfig: ResolvedCommandKitConfig = {
  plugins: [new MacroPlugin({ enabled: true })],
  esbuildPlugins: [],
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
};
