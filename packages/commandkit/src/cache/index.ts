import { AsyncLocalStorage } from 'node:async_hooks';
import ms from 'ms';
import { GenericFunction, getCommandKit } from '../context/async-context';
import { warnUnstable } from '../utils/warn-unstable';
import { randomUUID } from 'node:crypto';
import { Awaitable } from 'discord.js';

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

const getDefaultCacheTag = (): CacheTag => {
  return {
    tag: randomUUID(),
    ttl: DEFAULT_TTL,
  };
};

function cache<R extends any[], F extends GenericFunction<R>>(
  fn: F,
  params?: Partial<CacheTag>,
): F {
  warnUnstable('cache');
  params = Object.assign({}, getDefaultCacheTag(), params) satisfies CacheTag;

  const memoized = (async (...args) => {
    const commandkit = getCommandKit(true);
    const cache = commandkit.getCacheProvider();

    if (!cache) {
      throw new Error(
        'CacheProvider was not found, please provide a cache provider to the CommandKit instance.',
      );
    }

    const entryKey = params.tag as string;
    const entry = await cache.get(entryKey);

    // cache hit
    if (entry !== undefined) {
      return entry.value;
    }

    const ttl = typeof params.ttl === 'string' ? ms(params.ttl) : params.ttl;

    const writeCache = async (...args: any) => {
      const result = await fn(...args);

      await cache.set(entryKey, result, ttl);

      return result;
    };

    if (!CACHED_FUNCTIONS_STORE.has(fn)) {
      CACHED_FUNCTIONS_STORE.set(fn, {
        ...(params as CacheTag),
        target: fn,
        memo: memoized,
      });
    }

    if (!TAG_FUNCTION_MAP.has(entryKey)) {
      TAG_FUNCTION_MAP.set(entryKey, fn);
    }

    return writeCache(...args);
  }) as F;

  return memoized;
}

function useCache<R extends any[], F extends GenericFunction<R>>(fn: F): F {
  warnUnstable('"use cache"');

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
    const params = CACHED_FUNCTIONS_STORE.get(fn) ?? getDefaultCacheTag();

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

function cacheTag(tag: string): void;
function cacheTag(tag: CacheTag): void;
function cacheTag(tag: CacheTag | string): void {
  if (!tag) {
    throw new TypeError('cacheTag must be called with a tag.');
  }

  warnUnstable('cacheTag');

  const context = cacheContext.getStore();

  if (context === undefined) {
    throw new Error(
      'cacheTag must be called inside a function decorated with "use cache" directive.',
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

function cacheLife(life: string): void;
function cacheLife(life: number): void;
function cacheLife(life: string | number) {
  if (life == null) {
    throw new TypeError('cacheLife must be called with a time-to-live value.');
  }

  warnUnstable('cacheLife');

  const context = cacheContext.getStore();

  if (context === undefined) {
    throw new Error(
      'cacheLife must be called inside a function decorated with "use cache" directive.',
    );
  }

  if (typeof life === 'string') {
    context.params.ttl = ms(life);
  } else {
    context.params.ttl = life;
  }
}

async function invalidate(tag: string) {
  warnUnstable('invalidate');
  const commandkit = getCommandKit(true);
  const cache = commandkit.getCacheProvider();

  if (!cache) {
    throw new Error(
      'CacheProvider was not found, please provide a cache provider to the CommandKit instance.',
    );
  }

  await cache.delete(tag);
}

async function revalidate<R = any>(
  tag: string,
  ...args: any[]
): Promise<R | undefined> {
  warnUnstable('revalidate');
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
  cache as unstable_cache,
  useCache as unstable_super_duper_secret_internal_for_use_cache_directive_of_commandkit_cli_do_not_use_it_directly_or_you_will_be_fired_kthxbai,
  cacheTag as unstable_cacheTag,
  cacheLife as unstable_cacheLife,
  invalidate as unstable_invalidate,
  revalidate as unstable_revalidate,
};
