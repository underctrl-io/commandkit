import { defineConfig } from 'tsup';
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';

export default defineConfig({
  format: ['esm'],
  entry: ['./src'],
  sourcemap: true,
  keepNames: true,
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  esbuildPlugins: [esbuildPluginVersionInjector()],
});
