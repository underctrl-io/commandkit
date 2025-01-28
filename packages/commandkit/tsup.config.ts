import { defineConfig } from 'tsup';
import { esbuildPluginUseMacro } from 'use-macro';

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['./src'],
  sourcemap: true,
  minifyIdentifiers: false,
  minifySyntax: true,
  minifyWhitespace: true,
  keepNames: true,
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  target: 'node16',
  esbuildPlugins: [esbuildPluginUseMacro()],
});
