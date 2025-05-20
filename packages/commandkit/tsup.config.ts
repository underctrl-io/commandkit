import { defineConfig } from 'tsup';
import { esbuildPluginUseMacro } from 'use-macro';

export default defineConfig({
  format: ['cjs'],
  entry: ['src'],
  outDir: './dist',
  sourcemap: true,
  watch: false,
  minify: true,
  minifyIdentifiers: true,
  keepNames: true,
  dts: true,
  shims: true,
  splitting: false,
  skipNodeModulesBundle: true,
  clean: true,
  target: 'node16',
  // @ts-ignore
  esbuildPlugins: [esbuildPluginUseMacro()],
});
