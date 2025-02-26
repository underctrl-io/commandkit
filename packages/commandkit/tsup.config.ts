import { defineConfig } from 'tsup';
import { esbuildPluginUseMacro } from 'use-macro';

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['./src/index.ts'],
  sourcemap: true,
  minifyIdentifiers: false,
  minifySyntax: true,
  minifyWhitespace: true,
  keepNames: true,
  dts: true,
  shims: true,
  splitting: true,
  skipNodeModulesBundle: true,
  clean: true,
  target: 'node16',
  esbuildPlugins: [esbuildPluginUseMacro()],
});
