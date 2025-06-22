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

## Redis Mutex Storage

This package also provides a Redis-based mutex storage implementation for distributed locking:

```ts
import { createMutex } from 'commandkit/mutex';
import { RedisMutexStorage } from '@commandkit/redis';
import { Redis } from 'ioredis';

// Create Redis client
const redis = new Redis();

// Create Redis-based mutex storage
const redisMutexStorage = new RedisMutexStorage(redis);

// Create mutex with Redis storage
const mutex = createMutex({
  timeout: 30000,
  storage: redisMutexStorage,
});

// Use the mutex for distributed locking
const result = await mutex.withLock('shared-resource', async () => {
  // This code runs with exclusive access across all instances
  return await updateSharedResource();
});
```

### Redis Mutex Features

- **Distributed Locking**: Works across multiple application instances
- **Automatic Expiration**: Locks automatically expire to prevent deadlocks
- **Abort Signal Support**: Can be cancelled using AbortSignal
- **Atomic Operations**: Uses Lua scripts for atomic lock operations
- **Lock Extension**: Extend lock timeouts if needed
- **Force Release**: Emergency release of locks (use with caution)

### Advanced Mutex Usage

```ts
import { RedisMutexStorage } from '@commandkit/redis';

const redisStorage = new RedisMutexStorage(redis);

// Get detailed lock information
const lockInfo = await redisStorage.getLockInfo('my-resource');
console.log(`Locked: ${lockInfo.locked}, TTL: ${lockInfo.ttl}ms`);

// Extend a lock
const extended = await redisStorage.extendLock('my-resource', 60000);
if (extended) {
  console.log('Lock extended by 60 seconds');
}

// Force release a lock (emergency use only)
await redisStorage.forceRelease('my-resource');
```

## Redis Semaphore Storage

This package also provides a Redis-based semaphore storage implementation for distributed concurrency control:

```ts
import { createSemaphore } from 'commandkit/semaphore';
import { RedisSemaphoreStorage } from '@commandkit/redis';
import { Redis } from 'ioredis';

// Create Redis client
const redis = new Redis();

// Create Redis-based semaphore storage
const redisSemaphoreStorage = new RedisSemaphoreStorage(redis);

// Create semaphore with Redis storage
const semaphore = createSemaphore({
  permits: 5,
  timeout: 30000,
  storage: redisSemaphoreStorage,
});

// Use the semaphore for distributed concurrency control
const result = await semaphore.withPermit('database-connection', async () => {
  // This code runs with limited concurrency across all instances
  return await executeDatabaseQuery();
});
```

### Redis Semaphore Features

- **Distributed Concurrency Control**: Works across multiple application instances
- **Automatic Initialization**: Semaphores are automatically initialized when first used
- **Abort Signal Support**: Can be cancelled using AbortSignal
- **Atomic Operations**: Uses Lua scripts for atomic permit operations
- **Dynamic Permit Management**: Increase or decrease permits at runtime
- **Semaphore Information**: Get detailed information about permit usage

### Advanced Semaphore Usage

```ts
import { RedisSemaphoreStorage } from '@commandkit/redis';

const redisStorage = new RedisSemaphoreStorage(redis);

// Get detailed semaphore information
const info = await redisStorage.getSemaphoreInfo('database');
console.log(`Total: ${info.total}, Available: ${info.available}, Acquired: ${info.acquired}`);

// Initialize a semaphore with specific permits
await redisStorage.initialize('api-endpoint', 10);

// Increase permits dynamically
await redisStorage.increasePermits('database', 5);

// Decrease permits dynamically
await redisStorage.decreasePermits('api-endpoint', 2);

// Reset semaphore to initial state
await redisStorage.reset('database');

// Clear semaphore completely
await redisStorage.clear('old-semaphore');
```