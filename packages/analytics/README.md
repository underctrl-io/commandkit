# `@commandkit/analytics`

Analytics providers for CommandKit.

## Installation

```sh
npm install @commandkit/analytics
```

## Usage

This package provides a commandkit plugin that automatically registers the analytics provider with the commandkit instance.

### PostHog

```js
import { posthog } from '@commandkit/analytics/posthog';

export default defineConfig({
  plugins: [
    posthog({
      posthogOptions: {
        apiKey: 'YOUR_POSTHOG_API_KEY',
        options?: PostHogOptions
      }
    })
  ],
});
```

### Umami

```js
import { umami } from '@commandkit/analytics/umami';

export default defineConfig({
  plugins: [
    umami({
      umamiOptions: {
        hostUrl: 'YOUR_UMAMI_HOST_URL',
        websiteId?: 'YOUR_UMAMI_WEBSITE_ID',
        sessionId?: 'YOUR_UMAMI_SESSION_ID',
        userAgent?: 'YOUR_UMAMI_USER_AGENT',
      }
    })
  ],
});
```

### Tracking events

```js
import { track } from 'commandkit/analytics';

await track({
  name: 'YOUR_EVENT_NAME',
  id?: 'YOUR_UNIQUE_ID',
  data: {...}
});
```

### Disabling analytics per-request scope

The `noAnalytics` function can be used to disable analytics for a specific request. This can be useful if you want to disable analytics for a specific user or guild, etc.

```js
import { noAnalytics } from 'commandkit/analytics';

// call inside command or event or middlewares
if (someCondition) {
  noAnalytics();
}
```