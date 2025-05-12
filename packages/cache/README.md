# `@commandkit/cache`

CommandKit plugin for cache management.

## Installation

```bash
npm install @commandkit/cache
```

## Usage

To use the `@commandkit/cache` plugin, you need to add it to your CommandKit application. This can be done by importing the plugin and adding it to your configuration.

```ts
import { cache } from '@commandkit/cache';

export default defineConfig({
  plugins: [
    cache(),
  ],
})
```

Next, you can define advanced configurations for the plugin if needed. For example, you can set a custom cache provider:

```ts
import { setCacheProvider } from '@commandkit/cache';
import { RedisCache } from '@commandkit/redis';

setCacheProvider(new RedisCache({...}));
```

Then, you can add `"use cache"` directive to the function you want to cache. For example:

```ts
import { cacheTag, cacheLife } from '@commandkit/cache';

async function fetchDogs() {
  "use cache";

  cacheTag('dogs');
  cacheLife('1h');

  const dogs = await fetch('https://example.com/dogs');
  return dogs.json();
}
```

Now the `fetchDogs` function will be cached for 1 hour. You can perform on-demand cache invalidation or revalidation using the `invalidate` and `revalidate` methods:

```ts
import { invalidate, revalidate } from '@commandkit/cache';

async function refreshCache() {
  // invalidate the cache for the "dogs" tag. This will remove the cached data.
  // calling the function again will fetch fresh data.
  await invalidate('dogs');

  // revalidate the cache for the "dogs" tag. This will fetch fresh data and update the cache.
  await revalidate('dogs');
}
```