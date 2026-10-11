import { defineConfig } from 'tsdown';
import { rollupPluginUseMacro } from 'use-macro/rollup';

export default defineConfig({
  format: ['cjs'],
  entry: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.spec.tsx',
  ],
  outDir: './dist',
  sourcemap: true,
  watch: false,
  minify: false,
  dts: true,
  shims: false,
  deps: {
    neverBundle: true,
  },
  clean: true,
  platform: 'node',
  target: 'node16',
  outputOptions: {
    exports: 'named',
  },
  fixedExtension: false,
  outExtensions: (context) => {
    return {
      dts: '.d.ts',
      js: context.format === 'es' ? '.mjs' : '.js',
    };
  },
  logLevel: 'silent',
  unbundle: false,
  plugins: [rollupPluginUseMacro({ execution: { mode: 'trusted' } })],
});
