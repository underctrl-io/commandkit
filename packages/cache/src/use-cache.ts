import { AsyncLocalStorage } from 'node:async_hooks';
import {
  AsyncFunction,
  defer,
  GenericFunction,
  getCommandKit,
} from 'commandkit';
import { AnalyticsEvents } from 'commandkit/analytics';
import ms, { type StringValue } from 'ms';
import { getCacheProvider } from './cache-plugin';
import { createHash } from './utils';

const cacheContext = new AsyncLocalStorage<CacheContext>();
const fnStore = new Map<
  string,
  {
    key: string;
    hash: string;
    ttl?: number;
    tags: Set<string>;
    lastAccess: number;
  }
>();
const CACHED_FN_SYMBOL = Symbol('commandkit.cache.sentinel');

/**
 * Context for managing cache operations within an async scope
 */
export interface CacheContext {
  params: {
    /** Custom name for the cache entry */
    name?: string;
    /** Time-to-live in milliseconds */
    ttl?: number | null;
    tags: Set<string>;
  };
}

/**
 * Configuration options for cache behavior
 */
export interface CacheMetadata {
  /** Time-to-live duration in milliseconds or as a string (e.g., '1h', '5m') */
  ttl?: number | string;
  /** Custom name for the cache entry */
  name?: string;
  tags?: string[];
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
function useCache<R extends any[], F extends AsyncFunction<R>>(fn: F): F {
  // assign unique id to the function to avoid collisions with other functions
  const metadata = crypto.randomUUID();

  const memo = (async (...args) => {
    const analytics = getCommandKit()?.analytics;
    const keyHash = createHash(metadata, args);

    return cacheContext.run(
      {
        params: {
          ttl: null,
          tags: new Set(),
        },
      },
      async () => {
        const provider = getCacheProvider();
        const context = cacheContext.getStore();

        if (!context) {
          throw new Error('Cache context was not found.');
        }

        const storedFn = fnStore.get(keyHash);
        const effectiveKey = storedFn?.key ?? keyHash;

        // Update last access time
        if (storedFn) {
          storedFn.lastAccess = Date.now();
        }

        const start = performance.now();
        const cached = await provider.get(effectiveKey);
        const end = performance.now() - start;

        if (cached && cached.value != null) {
          defer(() =>
            analytics?.track({
              name: AnalyticsEvents.CACHE_HIT,
              id: 'commandkit',
              data: {
                time: end.toFixed(2),
                tags: Array.from(storedFn?.tags ?? []),
              },
            }),
          );

          return cached.value;
        }

        const rawStart = performance.now();
        const result = await fn(...args);
        const rawEnd = performance.now() - rawStart;

        if (result != null) {
          const ttl = context.params.ttl;
          await provider.set(keyHash, result, ttl ?? undefined);

          fnStore.set(keyHash, {
            key: keyHash,
            hash: keyHash,
            ttl: ttl ?? undefined,
            tags: context.params.tags,
            lastAccess: Date.now(),
          });
        }

        defer(() =>
          analytics?.track({
            name: AnalyticsEvents.CACHE_MISS,
            id: 'commandkit',
            data: {
              time: rawEnd.toFixed(2),
              tags: Array.from(
                context.params.tags.size
                  ? context.params.tags
                  : (storedFn?.tags ?? []),
              ),
            },
          }),
        );

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

  context.params.tags.add(tag);
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
    throw new Error('cacheLife() must be called with a ttl value.');
  }

  context.params.ttl = typeof ttl === 'string' ? ms(ttl as StringValue) : ttl;
}

/**
 * Marks cache entries for invalidation by their tag. The invalidation only happens when the path is next visited.
 * @param tag - The cache tag to revalidate
 * @example
 * ```ts
 * await revalidateTag('user:123');
 * ```
 */
export async function revalidateTag(tag: string): Promise<void> {
  const provider = getCacheProvider();
  const entries = Array.from(fnStore.values()).filter((v) => v.tags.has(tag));

  // Batch delete operations for better performance
  await Promise.all(entries.map((entry) => provider.delete(entry.key)));

  defer(() =>
    getCommandKit()?.analytics?.track({
      name: AnalyticsEvents.CACHE_REVALIDATED,
      id: 'commandkit',
      data: { tag },
    }),
  );
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
 * Cleans up stale cache entries.
 * @param maxAge The maximum age of cache entries to keep (in milliseconds).
 */
export async function cleanup(
  maxAge: number = 24 * 60 * 60 * 1000,
): Promise<void> {
  const now = Date.now();
  const staleEntries = Array.from(fnStore.entries()).filter(
    ([_, entry]) => now - entry.lastAccess > maxAge,
  );

  const provider = getCacheProvider();
  await Promise.all(
    staleEntries.map(async ([key, entry]) => {
      await provider.delete(entry.key);
      fnStore.delete(key);
    }),
  );
}

/**
 * @private
 * @internal
 */
export const $ckitiucw: any = useCache;

if (!('$ckitiucw' in globalThis)) {
  Object.defineProperty(globalThis, '$ckitiucw', {
    value: useCache,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}
