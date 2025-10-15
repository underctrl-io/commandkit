import { defineConfig, noBuildOnly } from 'commandkit/config';
import { i18n } from '@commandkit/i18n';
import { devtools } from '@commandkit/devtools';
import { cache } from '@commandkit/cache';
import { ai } from '@commandkit/ai';
import { tasks } from '@commandkit/tasks';

const setup = noBuildOnly(() => {
  setInterval(() => {
    console.log(`Hello from ${process.pid}`);
  }, 1000);
});

setup();

export default defineConfig({
  plugins: [
    i18n(),
    devtools(),
    cache(),
    ai(),
    tasks({
      initializeDefaultDriver: true,
      sqliteDriverDatabasePath: './tasks.db',
    }),
  ],
});
