import { CacheProvider, CacheEntry } from '@commandkit/cache';
import { warnDeprecated } from 'commandkit';
import Redis, { type RedisOptions } from 'ioredis';

export type Awaitable<T> = T | Promise<T>;
export type SerializeFunction = (value: any) => Awaitable<string>;
export type DeserializeFunction = (value: string) => Awaitable<any>;

/**
 * A cache provider that uses Redis as the cache store.
 * @example const redisCache = new RedisCache();
 * setCacheProvider(redisCache);
 * @deprecated Import `RedisCache` from `@commandkit/cache/redis` instead.
 */
export class RedisCache extends CacheProvider {
  public redis: Redis;

  /**
   * Serialize function used to serialize values before storing them in the cache.
   * By default, it uses `JSON.stringify`.
   */
  public serialize: SerializeFunction;

  /**
   * Deserialize function used to deserialize values before returning them from the cache.
   * By default, it uses `JSON.parse`.
   */
  public deserialize: DeserializeFunction;

  /**
   * Create a new RedisCache instance.
   */
  public constructor();
  /**
   * Create a new RedisCache instance with the provided Redis client.
   * @param redis The Redis client to use.
   */
  public constructor(redis: Redis);
  /**
   * Create a new RedisCache instance with the provided Redis options.
   * @param redis The Redis client to use.
   */
  public constructor(redis: RedisOptions);
  public constructor(redis?: Redis | RedisOptions) {
    warnDeprecated({
      what: 'RedisCache',
      where: '@commandkit/redis',
      message: 'Import `RedisCache` from `@commandkit/cache/redis` instead.',
    });

    super();

    if (redis instanceof Redis) {
      this.redis = redis;
    } else {
      this.redis = new Redis(redis ?? {});
    }

    this.serialize = JSON.stringify;
    this.deserialize = JSON.parse;
  }

  /**
   * Retrieve a value from the cache.
   * @param key The key to retrieve the value for.
   * @returns The value stored in the cache, or `undefined` if it does not exist.
   */
  public async get<T>(key: string): Promise<CacheEntry<T> | undefined> {
    const value = await this.redis.get(key);

    if (value === null) {
      return undefined;
    }

    const entry = this.deserialize(value) as CacheEntry<T>;
    if (entry.ttl && Date.now() > entry.ttl) {
      await this.delete(key);
      return undefined;
    }

    return entry;
  }

  /**
   * Store a value in the cache.
   * @param key The key to store the value under.
   * @param value The value to store in the cache.
   * @param ttl The time-to-live for the cache entry in milliseconds.
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      ttl: ttl != null ? Date.now() + ttl : undefined,
    };

    const serialized = this.serialize(entry);
    const finalValue =
      serialized instanceof Promise ? await serialized : serialized;

    if (typeof ttl === 'number') {
      await this.redis.set(key, finalValue, 'PX', ttl);
    } else {
      await this.redis.set(key, finalValue);
    }
  }

  /**
   * Clear all entries from the cache.
   */
  public async clear(): Promise<void> {
    await this.redis.flushall();
  }

  /**
   * Delete a value from the cache.
   * @param key The key to delete the value for.
   */
  public async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Check if a value exists in the cache.
   * @param key The key to check for.
   * @returns True if the key exists in the cache, false otherwise.
   */
  public async exists(key: string): Promise<boolean> {
    return Boolean(await this.redis.exists(key));
  }

  /**
   * Set the time-to-live for a cache entry.
   * @param key The key to set the time-to-live for.
   * @param ttl The time-to-live value in milliseconds.
   */
  public async expire(key: string, ttl: number): Promise<void> {
    await this.redis.pexpire(key, ttl);
  }
}
