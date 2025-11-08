import { defineConfig, noBuildOnly } from 'commandkit/config';
import { i18n } from '@commandkit/i18n';
import { devtools } from '@commandkit/devtools';
import { cache } from '@commandkit/cache';
import { ai } from '@commandkit/ai';
import { tasks, setDriver } from '@commandkit/tasks';
import { BullMQDriver } from '@commandkit/tasks/bullmq';
import { workflow } from '@commandkit/workflow';

noBuildOnly(() => {
  setDriver(
    new BullMQDriver({
      maxRetriesPerRequest: null,
    }),
  );
})();

export default defineConfig({
  plugins: [
    i18n(),
    devtools(),
    cache(),
    ai(),
    tasks({
      initializeDefaultDriver: false,
    }),
    workflow(),
  ],
});
