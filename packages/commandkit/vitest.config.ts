import { defineConfig } from 'vitest/config';
import { vite as cacheDirectivePlugin } from 'directive-to-hof';
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
    cacheDirectivePlugin({
      directive: 'use cache',
      importPath: 'commandkit',
      importName: '__SECRET_USE_CACHE_INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED',
      asyncOnly: true,
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      jsxFactory: 'CommandKit.createElement',
      jsxFragment: 'CommandKit.Fragment',
    },
  },
});
