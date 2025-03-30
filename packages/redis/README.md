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