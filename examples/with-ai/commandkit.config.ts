import { defineConfig } from 'commandkit/config';
import { ai } from '@commandkit/ai';
import { tasks } from '@commandkit/tasks';

export default defineConfig({
  plugins: [ai(), tasks()],
});
