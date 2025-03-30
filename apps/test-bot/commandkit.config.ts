import { defineConfig } from 'commandkit';
import { devtools } from '@commandkit/devtools';

export default defineConfig({
  plugins: [devtools()],
  typedLocales: true,
});
