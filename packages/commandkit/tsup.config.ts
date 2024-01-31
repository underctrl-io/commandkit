import { defineConfig } from 'tsup';
import { esbuildPluginVersionInjector } from 'esbuild-plugin-version-injector';

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
    esbuildPlugins: [esbuildPluginVersionInjector()],
});
