import { defineConfig } from 'commandkit/config';
import { cache } from '@commandkit/cache';
import { i18n } from '@commandkit/i18n';
import { umami } from '@commandkit/analytics/umami';

export default defineConfig({
  plugins: [
    cache(),
    i18n(),
    umami({
      umamiOptions: {
        websiteId: process.env.UMAMI_WEBSITE_ID,
        hostUrl: process.env.UMAMI_HOST_URL,
      },
    }),
  ],
});
