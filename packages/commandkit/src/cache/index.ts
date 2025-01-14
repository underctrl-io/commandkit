import { AsyncLocalStorage } from 'node:async_hooks';
import { GenericFunction, getCommandKit } from '../context/async-context';
import { warnUnstable } from '../utils/warn-unstable';
import { randomUUID } from 'node:crypto';
import ms from 'ms';
import { CacheProvider } from './CacheProvider';
import { Collection } from 'discord.js';

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

interface CachedFunction extends CacheOptions {
  /**
   * The function to be cached.
   */
  fn: GenericFunction;
}

const cacheContext = new AsyncLocalStorage<CachedFunction>();
const CACHE_FN_STORE = new Collection<GenericFunction, CachedFunction>();
const DEFAULT_TTL = 900_000; // 15 minutes

function getCacheProvider() {
  const commandkit = getCommandKit(true);
  const cacheProvider = commandkit.getCacheProvider();

  if (!cacheProvider) {
    throw new Error(
      'Cache api of commandkit cannot be used without setting a CacheProvider.',
    );
  }

  return cacheProvider;
}

function resolveCacheParams(options?: string | CacheOptions) {
  const name = typeof options === 'string' ? options : options?.name;
  const ttl = typeof options === 'string' ? undefined : options?.ttl;

  return {
    name: name ?? randomUUID(),
    ttl: (typeof ttl === 'string' ? ms(ttl) : (ttl ?? DEFAULT_TTL)) as number,
  };
}

function memo<R, F extends (...args: any[]) => Promise<R>>(
  fn: F,
  cache: CacheProvider,
  params?: CacheOptions,
  fb?: GenericFunction,
): F {
  return (async (...args) => {
    const parameters = params ?? CACHE_FN_STORE.get(fb || fn);

    console.log({ parameters });

    if (!parameters) {
      return fn(...args);
    }

    const { name, ttl } = parameters;

    const cachedValue = await cache.get(name);

    if (cachedValue) {
      console.log('Cache hit:', name);
      return cachedValue.value;
    }

    console.log('Cache miss:', name);

    const value = await fn(...args);

    await cache.set(name, value, ttl);

    return value;
  }) as F;
}

/**
 * Create a cached function.
 * @param fn The function to cache.
 * @param options The cache options.
 * @returns The cached function.
 */
function cache<R, F extends (...args: any[]) => Promise<R>>(
  fn: F,
  options?: string | CacheOptions | undefined,
): F {
  warnUnstable('cache()');

  const provider = getCacheProvider();
  const params = resolveCacheParams(options);

  CACHE_FN_STORE.set(fn, {
    ...params,
    fn,
  });

  return memo(fn, provider, params);
}

/**
 * Applies cache to a function using the "use cache" directive.
 * @param fn The function to cache.
 * @private
 */
function use_cache<R, F extends (...args: any[]) => Promise<R>>(fn: F): F {
  warnUnstable('"use cache"');

  const provider = getCacheProvider();
  const params = resolveCacheParams();

  const memoized = (async (...args) => {
    const result = await cacheContext.run({ ...params, fn: memoized }, () => {
      return memo(fn, provider, undefined, memoized)(...args);
    });

    return result;
  }) as F;

  CACHE_FN_STORE.set(memoized, {
    ...params,
    fn: memoized,
  });

  return memoized;
}

/**
 * Tags the current cache function with a name (or both ttl and name). This only works inside a function that uses the "use cache" directive.
 * @param tag The tag to apply.
 */
function cacheTag(tag: string | CacheOptions) {
  warnUnstable('cacheTag()');

  const params = cacheContext.getStore();

  if (!params) {
    throw new Error(
      'cacheTag() must be used inside a function with "use cache" directive.',
    );
  }

  const overwritten = resolveCacheParams(tag);

  if (overwritten.name) {
    params.name = overwritten.name;
  }

  if (overwritten.ttl !== undefined) {
    params.ttl = overwritten.ttl;
  }

  CACHE_FN_STORE.set(params.fn, params);
}

/**
 * Applies a new time-to-live to the current cache function. This only works inside a function that uses the "use cache" directive.
 * @param ttl The time-to-live of the cache key in milliseconds or milliseconds parsable string.
 */
function cacheLife(ttl: string | number) {
  warnUnstable('cacheLife()');

  const context = cacheContext.getStore();

  if (!context) {
    throw new Error(
      'cacheLife() can only be used inside a function that use the "use cache" directive.',
    );
  }

  const newTTL = typeof ttl === 'string' ? ms(ttl) : ttl;

  context.ttl = newTTL;

  CACHE_FN_STORE.set(context.fn, context);
}

/**
 * Invalidates a cache key. This will cause the next call to the cache key to fetch fresh data.
 * @param tag The cache key to invalidate.
 */
async function invalidate(tag: string) {
  warnUnstable('invalidate()');

  if (!CACHE_FN_STORE.some((s) => s.name === tag)) return;

  const provider = getCacheProvider();

  await provider.delete(tag);
}

/**
 * Revalidates a cache key. This will immediately fetch the fresh data and update the cache.
 * @param tag The cache key to revalidate.
 * @param args The arguments to pass to the cached function.
 */
async function revalidate(tag: string, ...args: any[]) {
  warnUnstable('revalidate()');

  const target = CACHE_FN_STORE.find((s) => s.name === tag);

  if (!target) return;

  const provider = getCacheProvider();

  await provider.delete(tag);

  await target.fn(...args);
}

/**
 * Expires a cache key.
 * @param tag The cache key to expire.
 * @param ttl The new time-to-live of the cache key in milliseconds or milliseconds parsable string. If not provided, the cache key will be deleted.
 */
async function expire(tag: string, ttl?: string | number | null | undefined) {
  warnUnstable('expire()');

  const target = CACHE_FN_STORE.find((s) => s.name === tag);
  if (!target) return;

  const provider = getCacheProvider();

  if (ttl == null) {
    await provider.delete(tag);
    return;
  }

  const resolvedTTL = typeof ttl === 'string' ? ms(ttl) : ttl;

  await provider.expire(tag, resolvedTTL);

  CACHE_FN_STORE.set(target.fn, {
    ...target,
    ttl: resolvedTTL,
  });
}

export {
  cache as unstable_cache,
  use_cache as unstable_super_duper_secret_internal_for_use_cache_directive_of_commandkit_cli_do_not_use_it_directly_or_you_will_be_fired_kthxbai,
  cacheTag as unstable_cacheTag,
  cacheLife as unstable_cacheLife,
  invalidate as unstable_invalidate,
  revalidate as unstable_revalidate,
  expire as unstable_expire,
};
