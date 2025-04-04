import { AsyncLocalStorage } from 'node:async_hooks';
import { GenericFunction, getCommandKit } from '../context/async-context';
import { randomUUID } from 'node:crypto';
import ms from 'ms';
import { createObjectHash } from './utils';

const cacheContext = new AsyncLocalStorage<CacheContext>();
const fnStore = new Map<
  string,
  {
    key: string;
    hash: string;
    ttl: number;
    original: GenericFunction;
    memo: GenericFunction;
  }
>();
const DEFAULT_TTL = ms('15m');
const CACHE_FN_ID = `__cache_fn_id_${Date.now()}__${Math.random()}__`;
const CACHED_FN_SYMBOL = Symbol('commandkit.cache.sentinel');

/**
 * Context for managing cache operations within an async scope
 */
export interface CacheContext {
  params: {
    /** Custom name for the cache entry */
    name?: string;
    /** Time-to-live in milliseconds */
    ttl?: number;
  };
}

/**
 * Represents an async function that can be cached
 * @template R - Array of argument types
 * @template T - Return type
 */
export type AsyncFunction<R extends any[] = any[], T = any> = (
  ...args: R
) => Promise<T>;

/**
 * Configuration options for cache behavior
 */
export interface CacheMetadata {
  /** Time-to-live duration in milliseconds or as a string (e.g., '1h', '5m') */
  ttl?: number | string;
  /** Custom name for the cache entry */
  name?: string;
}

/**
 * Retrieves the configured cache provider from CommandKit context
 * @internal
 * @throws {Error} When no cache provider is configured
 */
function getCacheProvider() {
  const commandkit = getCommandKit(true);
  const provider = commandkit.getCacheProvider();

  if (!provider) {
    throw new Error(
      `Cache provider was not found, please provide a cache provider to commandkit.`,
    );
  }

  return provider;
}

/**
 * Internal cache implementation
 * @internal
 * @private
 * This is used directly by the compiler if the function is annotated with `"use cache"` directive.
 * @example
 * ```ts
 * async function myCachedFunction() {
 *   "use cache";
 *   // can use cacheTag() and cacheLife() here to customize cache behavior
 *   return await db.query('SELECT * FROM users');
 * }
 * ```
 */
function useCache<R extends any[], F extends AsyncFunction<R>>(
  fn: F,
  id?: string,
  params?: CacheMetadata,
): F {
  const isLocal = id === CACHE_FN_ID;

  if (id && !isLocal) {
    throw new Error('Illegal use of cache function.');
  }

  const fnId = randomUUID();

  const memo = (async (...args) => {
    const forcedName = isLocal ? params?.name : null;
    const keyHash = forcedName ?? (await createObjectHash(fnId, ...args));

    const resolvedTTL =
      isLocal && params?.ttl != null
        ? typeof params.ttl === 'string'
          ? ms(params.ttl)
          : params.ttl
        : null;

    return cacheContext.run(
      {
        params: {
          name: keyHash,
          ttl: resolvedTTL ?? DEFAULT_TTL,
        },
      },
      async () => {
        const provider = getCacheProvider();
        const context = cacheContext.getStore();

        if (!context) {
          throw new Error('Cache context was not found.');
        }

        // Get the effective cache key, preferring any existing association
        const storedFn = fnStore.get(keyHash);
        const effectiveKey = storedFn?.key ?? context.params.name!;

        // Try to get cached value using effective key
        const cached = await provider.get(effectiveKey);
        if (cached && cached.value != null) return cached.value;

        // If we reach here, we need to cache the value
        const result = await fn(...args);

        // Only cache if result is not null/undefined
        if (result != null) {
          // Get the final key name (might have been modified by cacheTag)
          const finalKey = context.params.name!;
          const ttl = context.params.ttl ?? DEFAULT_TTL;

          // Store the result
          await provider.set(finalKey, result, ttl);

          // Update function store
          fnStore.set(keyHash, {
            key: finalKey,
            hash: keyHash,
            ttl,
            original: fn,
            memo,
          });
        }

        return result;
      },
    );
  }) as F;

  if (!Object.prototype.hasOwnProperty.call(fn, CACHED_FN_SYMBOL)) {
    Object.defineProperty(memo, CACHED_FN_SYMBOL, {
      get() {
        return true;
      },
      configurable: false,
      enumerable: false,
    });
  }

  return memo;
}

/**
 * Wraps an async function with caching capability
 * @template R - Array of argument types
 * @template F - Type of the async function
 * @param fn - The async function to cache
 * @param params - Optional cache configuration
 * @returns The wrapped function with caching behavior
 * @example
 * ```ts
 * const cachedFetch = cache(async (id: string) => {
 *   return await db.findOne(id);
 * }, { ttl: '1h' });
 * ```
 */
export function cache<R extends any[], F extends AsyncFunction<R>>(
  fn: F,
  params?: CacheMetadata,
): F {
  return useCache(fn, CACHE_FN_ID, params);
}

/**
 * Sets a custom identifier for the current cache operation
 * @param tag - The custom cache tag
 * @throws {Error} When called outside a cached function or without a tag
 * @example
 * ```ts
 * const fetchUser = cache(async (id: string) => {
 *   cacheTag(`user:${id}`);
 *   return await db.users.findOne(id);
 * });
 * ```
 */
export function cacheTag(tag: string): void {
  const context = cacheContext.getStore();

  if (!context) {
    throw new Error('cacheTag() must be called inside a cached function.');
  }

  if (!tag) {
    throw new Error('cacheTag() must be called with a tag name.');
  }

  context.params.name = tag;
}

/**
 * Sets the TTL for the current cache operation
 * @param ttl - Time-to-live in milliseconds or as a string (e.g., '1h', '5m')
 * @throws {Error} When called outside a cached function or with invalid TTL
 * @example
 * ```ts
 * const fetchData = cache(async () => {
 *   cacheLife('30m');
 *   return await expensiveOperation();
 * });
 * ```
 */
export function cacheLife(ttl: number | string): void {
  const context = cacheContext.getStore();

  if (!context) {
    throw new Error('cacheLife() must be called inside a cached function.');
  }

  if (ttl == null || !['string', 'number'].includes(typeof ttl)) {
    throw new Error('cacheLife() must be called with a ttl.');
  }

  context.params.ttl = typeof ttl === 'string' ? ms(ttl) : ttl;
}

/**
 * Removes a cached value by its tag
 * @param tag - The cache tag to invalidate
 * @throws {Error} When the cache key is not found
 * @example
 * ```ts
 * await invalidate('user:123');
 * ```
 */
export async function invalidate(tag: string): Promise<void> {
  const provider = getCacheProvider();
  const entry = Array.from(fnStore.values()).find(
    (v) => v.key === tag || v.hash === tag,
  );

  if (!entry) return;

  await provider.delete(entry.key);
}

/**
 * Forces a refresh of cached data by its tag (on-demand revalidation)
 * @template T - Type of the cached value
 * @param tag - The cache tag to revalidate
 * @param args - Arguments to pass to the cached function
 * @returns Fresh data from the cached function
 * @throws {Error} When the cache key or function is not found
 * @example
 * ```ts
 * const freshData = await revalidate('user:123');
 * ```
 */
export async function revalidate<T = unknown>(
  tag: string,
  ...args: any[]
): Promise<T> {
  const provider = getCacheProvider();
  const entry = Array.from(fnStore.values()).find(
    (v) => v.key === tag || v.hash === tag,
  );

  if (!entry) return undefined as T;

  await provider.delete(entry.key);

  return entry.memo(...args);
}

/**
 * Checks if a function is wrapped with cache functionality
 * @param fn - Function to check
 * @returns True if the function is cached
 * @example
 * ```ts
 * if (isCachedFunction(myFunction)) {
 *   console.log('Function is cached');
 * }
 * ```
 */
export function isCachedFunction(fn: GenericFunction): boolean {
  return Object.prototype.hasOwnProperty.call(fn, CACHED_FN_SYMBOL);
}

/**
 * **WARNING!!!! DO NOT USE THIS UNLESS YOU KNOW WHAT YOU ARE DOING!**
 * @private
 * @internal
 */
export const zzz_commandkit_secret_internal_use_cache_wrapper_do_not_use_or_you_will_be_fired: any =
  useCache;
