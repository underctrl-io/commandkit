import { GenericFunction, getCommandKit } from '../context/async-context';
import { COMMANDKIT_CACHE_TAG } from '../utils/constants';
import { warnUnstable } from '../utils/warn-unstable';
import { randomUUID } from 'node:crypto';

export * from './CacheProvider';
export * from './MemoryCache';

export interface CacheOptions {
  /**
   * The name of the cache key.
   */
  name: string;
  /**
   * The time-to-live of the cache key in milliseconds.
   */
  ttl?: number;
}

/**
 * Assigns cache tag parameters to the function that uses the "use cache" directive.
 * @param options The cache options.
 * @param fn The function to assign the cache tag.
 */
export function unstable_cacheTag(
  options: string | number | CacheOptions,
  fn: GenericFunction,
): void {
  warnUnstable('cacheTag()');

  const isCacheable = Reflect.get(fn, COMMANDKIT_CACHE_TAG);

  if (!isCacheable) {
    throw new Error(
      'cacheTag() can only be used with cache() functions or functions that use the "use cache" directive.',
    );
  }

  const opt =
    typeof options === 'string'
      ? { name: options }
      : typeof options === 'number'
        ? { name: randomUUID(), ttl: options }
        : options;

  Reflect.set(fn, '__cache_params', opt);
}

/**
 * Cache a value.
 * @param options The cache options.
 */
export function unstable_cache<R, F extends (...args: any[]) => Promise<R>>(
  fn: F,
  options?: string | CacheOptions | undefined,
): F {
  warnUnstable('cache()');
  const commandkit = getCommandKit(true);
  const cache = commandkit.getCacheProvider();

  if (!cache) {
    throw new Error('cache() cannot be used without a cache provider.');
  }

  options ??= randomUUID();

  const params = typeof options === 'string' ? { name: options } : options;

  const _fn = (async (...args: Parameters<F>): Promise<R> => {
    const context = (Reflect.get(_fn, '__cache_params') ||
      params) as CacheOptions;

    // check cache
    const data = await cache.get(context.name);

    if (data) return data as R;

    // cache miss
    const result = await fn(...args);

    await cache.set(context.name, result, context.ttl);

    return result;
  }) as F;

  Reflect.set(_fn, '__cache_params', params);
  Reflect.set(_fn, COMMANDKIT_CACHE_TAG, true);

  return _fn;
}

/**
 * Revalidate a cache by its key.
 * @param cache The cache key or the function that was cached.
 * @param ttl The new time-to-live of the cache key in milliseconds. If not provided, the ttl will not be set (past ttl will be ignored).
 */
export async function unstable_revalidate(
  cache: string | GenericFunction,
  ttl?: number,
): Promise<void> {
  warnUnstable('revalidate()');
  const commandkit = getCommandKit(true);
  const cacheProvider = commandkit.getCacheProvider();

  if (!cacheProvider) {
    throw new Error('revalidate() cannot be used without a cache provider.');
  }

  const key =
    typeof cache === 'string'
      ? cache
      : Reflect.get(cache, '__cache_params')?.name;

  if (!key) {
    throw new Error('Invalid cache key.');
  }

  const data = await cacheProvider.get(key);

  if (data) {
    const _ttl = ttl ?? undefined;
    await cacheProvider.set(key, data, _ttl);
  }
}

/**
 * Invalidate a cache by its key.
 * @param cache The cache key or the function that was cached.
 */
export async function unstable_invalidate(
  cache: string | GenericFunction,
): Promise<void> {
  warnUnstable('invalidate()');
  const commandkit = getCommandKit(true);
  const cacheProvider = commandkit.getCacheProvider();

  if (!cacheProvider) {
    throw new Error('invalidate() cannot be used without a cache provider.');
  }

  const key =
    typeof cache === 'string'
      ? cache
      : Reflect.get(cache, '__cache_params')?.name;

  if (!key) {
    throw new Error('Invalid cache key.');
  }

  await cacheProvider.delete(key);
}

/**
 * Manually expire a cache by its key.
 * @param cache The cache key.
 * @param ttl The new time-to-live of the cache key in milliseconds. If not provided, the cache key will be deleted.
 */
export async function unstable_expire(
  cache: string | GenericFunction,
  ttl?: number,
): Promise<void> {
  warnUnstable('expire()');
  const commandkit = getCommandKit(true);
  const cacheProvider = commandkit.getCacheProvider();

  if (!cacheProvider) {
    throw new Error('expire() cannot be used without a cache provider.');
  }

  const name =
    typeof cache === 'string'
      ? cache
      : Reflect.get(cache, '__cache_params')?.name;

  if (!name) {
    throw new Error('Invalid cache key.');
  }

  if (typeof ttl === 'number') {
    await cacheProvider.expire(name, ttl);
  } else {
    await cacheProvider.delete(name);
  }
}
