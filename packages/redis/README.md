# `@commandkit/redis`

Redis cache provider for CommandKit.

## Installation

```sh
npm install @commandkit/redis
```

## Usage

```js
import { CommandKit } from 'commandkit';
import { RedisCache } from '@commandkit/redis';

new CommandKit({
  client,
  commandsPath,
  eventsPath,
  // uses default redis connection options (ioredis package)
  cacheProvider: new RedisCache(),
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