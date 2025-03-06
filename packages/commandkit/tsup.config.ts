import { defineConfig } from 'tsup';
import { esbuildPluginUseMacro } from 'use-macro';

export default defineConfig({
  format: ['cjs'],
  entry: ['src/index.ts'],
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
  // @ts-ignore
  esbuildPlugins: [esbuildPluginUseMacro()],
});
