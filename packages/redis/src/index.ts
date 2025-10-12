import { type RedisOptions } from 'ioredis';
import { CommandKitPluginRuntime, RuntimePlugin } from 'commandkit';
import { setCacheProvider } from '@commandkit/cache';
import { RedisCache } from './cache-storage';

export class RedisPlugin extends RuntimePlugin<RedisOptions> {
  public readonly name = 'RedisPlugin';

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    setCacheProvider(new RedisCache(this.options));
  }
}

/**
 * Create a new Redis plugin instance.
 * @param options The options to configure the Redis client.
 * @returns The created Redis plugin instance.
 */
export function redis(options?: RedisOptions) {
  return new RedisPlugin(options ?? {});
}

export * from './ratelimit-storage';
export * from './mutex-storage';
export * from './semaphore-storage';
export { RedisCache as RedisCacheProvider, RedisCache };
