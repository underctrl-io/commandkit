import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./spec/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    watch: false,
    dangerouslyIgnoreUnhandledErrors: true,
  },
});
