import { defineConfig } from 'commandkit';
import { legacy } from '@commandkit/legacy';
import { i18n } from '@commandkit/i18n';

export default defineConfig({
  plugins: [i18n(), legacy({ skipBuiltInValidations: true })],
});
