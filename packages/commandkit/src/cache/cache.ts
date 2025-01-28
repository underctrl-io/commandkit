import { AsyncLocalStorage } from 'node:async_hooks';
import ms from 'ms';
import { GenericFunction, getCommandKit } from '../context/async-context';
import { randomUUID } from 'node:crypto';

export type AsyncFunction<R extends any[] = any[], T = any> = (
  ...args: R
) => Promise<T>;

export interface CacheTag {
  tag: string;
  ttl: number | string;
}

export interface CacheParams extends CacheTag {
  target: GenericFunction;
  memo: GenericFunction;
}

interface CacheContext {
  target: GenericFunction;
  params: CacheTag;
  memo?: GenericFunction;
}

const CACHED_FUNCTIONS_STORE = new WeakMap<Function, CacheParams>();
const TAG_FUNCTION_MAP = new Map<string, Function>();
const DEFAULT_TTL = ms('15m');

const cacheContext = new AsyncLocalStorage<CacheContext>();

const __identificationKey = `__cache_identification_key_${Date.now()}__${Math.random()}__`;

const getDefaultCacheTag = (): CacheTag => {
  return {
    tag: randomUUID(),
    ttl: DEFAULT_TTL,
  };
};

/**
 * Cache a function with a specific tag and time-to-live.
 * @param fn The function to cache.
 * @param params The cache tag and time-to-live.
 * @returns The memoized function.
 */
function cache<R extends any[], F extends AsyncFunction<R>>(
  fn: F,
  params?: Partial<CacheTag>,
): F {
  params = Object.assign({}, getDefaultCacheTag(), params);

  return useCache(fn, __identificationKey, params as CacheTag);
}

/**
 * **DO NOT USE THIS FUNCTION DIRECTLY**
 * @internal
 * @private
 */
function useCache<R extends any[], F extends AsyncFunction<R>>(
  fn: F,
  id?: string,
  tag?: CacheTag,
): F {
  if (id !== undefined && id !== __identificationKey) {
    throw new TypeError('useCache may not be called directly.');
  }

  const isLocal = id === __identificationKey;

  const memoized = (async (...args) => {
    const commandkit = getCommandKit(true);
    const cache = commandkit.getCacheProvider();

    if (!cache) {
      throw new Error(
        'CacheProvider was not found, please provide a cache provider to the CommandKit instance.',
      );
    }

    const context = cacheContext.getStore();

    if (context === undefined) {
      throw new Error(
        'useCache must be called inside a function decorated with "use cache" directive.',
      );
    }

    const entryKey = context.params.tag;
    const entry = await cache.get(entryKey);

    // cache hit
    if (entry !== undefined) {
      return entry.value;
    }

    const ttl =
      typeof context.params.ttl === 'string'
        ? ms(context.params.ttl)
        : context.params.ttl;

    const writeCache = async (...args: any) => {
      const result = await fn(...args);

      CACHED_FUNCTIONS_STORE.set(fn, {
        ...context.params,
        target: fn,
        memo: cacheContext.exit(() => wrapper),
      });

      if (entryKey !== context.params.tag) {
        TAG_FUNCTION_MAP.delete(entryKey);
      }

      TAG_FUNCTION_MAP.set(context.params.tag, fn);

      await cache.set(entryKey, result, ttl);

      return result;
    };

    CACHED_FUNCTIONS_STORE.set(fn, {
      ...context.params,
      target: fn,
      memo: cacheContext.exit(() => wrapper),
    });

    TAG_FUNCTION_MAP.set(entryKey, fn);

    return writeCache(...args);
  }) as F;

  const wrapper = (async (...args: any) => {
    const params =
      CACHED_FUNCTIONS_STORE.get(fn) ??
      ((isLocal ? tag : null) || getDefaultCacheTag());

    return cacheContext.run(
      {
        params,
        target: fn,
      },
      () => memoized(...args),
    );
  }) as F;

  return wrapper;
}

/**
 * Tags the current function with the given cache tag name
 * @param tag The cache tag name.
 */
function cacheTag(tag: string): void;
/**
 * Tags the current function with the given cache tag parameters.
 * @param tag The cache tag parameters.
 */
function cacheTag(tag: CacheTag): void;
/**
 * Tags the current function with the given cache tag name or parameters.
 * @param tag The cache tag name or parameters.
 */
function cacheTag(tag: CacheTag | string): void {
  if (!tag) {
    throw new TypeError('cacheTag must be called with a tag.');
  }

  const context = cacheContext.getStore();

  if (context === undefined) {
    throw new Error(
      'cacheTag must be called inside cache() or a function decorated with "use cache" directive.',
    );
  }

  let tagObj: CacheTag;

  if (typeof tag === 'string') {
    tagObj = {
      tag,
      ttl: context.params?.ttl ?? DEFAULT_TTL,
    };
  } else {
    tagObj = tag;
  }

  context.params = tagObj;
}

/**
 * Sets the time-to-live for the current cache tag.
 * @param life The time-to-live value in milliseconds or a string.
 */
function cacheLife(life: string): void;
function cacheLife(life: number): void;
function cacheLife(life: string | number) {
  if (life == null) {
    throw new TypeError('cacheLife must be called with a time-to-live value.');
  }

  const context = cacheContext.getStore();

  if (context === undefined) {
    throw new Error(
      'cacheLife must be called inside cache() or a function decorated with "use cache" directive.',
    );
  }

  if (typeof life === 'string') {
    context.params.ttl = ms(life);
  } else {
    context.params.ttl = life;
  }
}

/**
 * Invalidates the cache with the given tag.
 * This will immediately remove the cache entry. The next time cache is requested, it will be re-fetched.
 * @param tag The cache tag to invalidate.
 */
async function invalidate(tag: string) {
  const commandkit = getCommandKit(true);
  const cache = commandkit.getCacheProvider();

  if (!cache) {
    throw new Error(
      'CacheProvider was not found, please provide a cache provider to the CommandKit instance.',
    );
  }

  await cache.delete(tag);
}

/**
 * Revalidates the cache with the given tag.
 * This will immediately remove the cache entry and re-fetch the value.
 * @param tag The cache tag to revalidate.
 * @param args The arguments to pass to the memoized function (if any).
 * @returns The new value of the cache.
 */
async function revalidate<R = any>(
  tag: string,
  ...args: any[]
): Promise<R | undefined> {
  const commandkit = getCommandKit(true);
  const cache = commandkit.getCacheProvider();

  if (!cache) {
    throw new Error(
      'CacheProvider was not found, please provide a cache provider to the CommandKit instance.',
    );
  }

  await cache.delete(tag);

  const tagFn = TAG_FUNCTION_MAP.get(tag);
  if (!tagFn) return undefined;

  const ctx = CACHED_FUNCTIONS_STORE.get(tagFn);
  if (!ctx) return undefined;

  return ctx.memo(...args) as R;
}

export {
  cache,
  useCache as super_duper_secret_internal_for_use_cache_directive_of_commandkit_cli_do_not_use_it_directly_or_you_will_be_fired_from_your_job_kthxbai,
  cacheTag,
  cacheLife,
  invalidate,
  revalidate,
};
