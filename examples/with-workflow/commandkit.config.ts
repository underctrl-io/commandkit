import { defineConfig } from 'commandkit/config';
import { workflow } from '@commandkit/workflow';

export default defineConfig({
  plugins: [workflow()],
});
