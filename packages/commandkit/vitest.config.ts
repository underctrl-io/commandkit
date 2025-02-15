import { defineConfig } from 'vitest/config';
import { cacheDirectivePlugin } from './src/cli/esbuild-plugins/use-cache';
import { join } from 'path';

export default defineConfig({
  test: {
    include: ['./spec/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    watch: false,
    dangerouslyIgnoreUnhandledErrors: true,
    env: {
      COMMANDKIT_TEST: 'true',
    },
  },
  resolve: {
    alias: {
      commandkit: join(import.meta.dirname, 'src', 'index.ts'),
    },
  },
  plugins: [
    {
      name: 'use-cache',
      async transform(code, id) {
        const valid = /\.(c|m)?(t|j)sx?$/.test(id);
        if (!valid) return null;

        const { contents } = await cacheDirectivePlugin(code, { path: id });

        return {
          code: contents,
          map: null,
        };
      },
    },
  ],
  optimizeDeps: {
    esbuildOptions: {
      jsxFactory: 'CommandKit.createElement',
      jsxFragment: 'CommandKit.Fragment',
    },
  },
});
