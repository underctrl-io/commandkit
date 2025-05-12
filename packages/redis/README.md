# `@commandkit/redis`

Redis cache provider for CommandKit.

## Installation

```sh
npm install @commandkit/redis
```

## Usage

This package provides a commandkit plugin that automatically registers the cache provider with the commandkit instance.

```js
import { redis } from '@commandkit/redis';

export default defineConfig({
  plugins: [redis()],
});
```

Now the cache functions such as the following will be cached in Redis:

```ts
async function getCachedData() {
  'use cache';

  // imaginary database function
  const data = await getFromDatabase('something');

  return data;
}
```

## Manual configuration

If you want to configure the Redis client manually, you can do so by not registering this plugin and instead updating the cache provider at runtime:

```ts
import { setCacheProvider } from '@commandkit/cache';
import { RedisCacheProvider } from '@commandkit/redis';
import { Redis } from 'ioredis';

// configure the redis client as needed
const redis = new Redis();
const redisProvider = new RedisCacheProvider(redis);

setCacheProvider(redisProvider)
```