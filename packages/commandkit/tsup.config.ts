import { defineConfig } from 'tsup';
import { esbuildPluginUseMacro } from 'use-macro';

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['src'],
  outDir: './dist',
  sourcemap: true,
  watch: false,
  minifyIdentifiers: false,
  keepNames: true,
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  target: 'node16',
  esbuildPlugins: [esbuildPluginUseMacro()],
});
