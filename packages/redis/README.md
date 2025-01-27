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