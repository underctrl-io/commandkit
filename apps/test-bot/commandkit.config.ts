import { defineConfig } from 'commandkit/config';
import { legacy } from '@commandkit/legacy';
import { i18n } from '@commandkit/i18n';
import { devtools } from '@commandkit/devtools';
import { cache } from '@commandkit/cache';

export default defineConfig({
  plugins: [
    i18n(),
    legacy({ skipBuiltInValidations: true }),
    devtools(),
    cache(),
  ],
});
