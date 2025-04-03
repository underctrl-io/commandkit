import { defineConfig } from 'commandkit';
import { legacy } from '@commandkit/legacy';

export default defineConfig({
  plugins: [legacy({ skipBuiltInValidations: true })],
});
