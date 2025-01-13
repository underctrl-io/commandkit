import { AsyncLocalStorage } from 'node:async_hooks';
import { GenericFunction, getCommandKit } from '../context/async-context';
import { warnUnstable } from '../utils/warn-unstable';
import { randomUUID } from 'node:crypto';
import ms from 'ms';

const cacheContext = new AsyncLocalStorage<CacheOptions | null>();
const CACHE_FN_STORE = new Map<GenericFunction, CacheOptions>();

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
 * Assigns cache tag parameters to the current function that uses the "use cache" directive.
 * @param options The cache options or the name of the cache key.
 */
export function unstable_cacheTag(options: string | CacheOptions): void {
  warnUnstable('cacheTag()');

  const context = cacheContext.getStore();

  if (context === undefined) {
    throw new Error(
      'cacheTag() can only be used inside a function that use the "use cache" directive.',
    );
  }

  // already tagged
  if (context === null) return;

  const opt = typeof options === 'string' ? { name: options } : options;

  if (opt.name) context.name = opt.name;
  if (opt.ttl !== undefined) context.ttl = opt.ttl;
}

/**
 * Assigns cache lifetime to the current function that uses the "use cache" directive.
 * @param ttl The time-to-live of the cache key in milliseconds or milliseconds parsable string.
 */
export function unstable_cacheLife(options: string | number): void {
  warnUnstable('cacheLife()');

  const context = cacheContext.getStore();

  if (context === undefined) {
    throw new Error(
      'cacheLife() can only be used inside a function that use the "use cache" directive.',
    );
  }

  // already tagged
  if (context === null) return;

  const ttl = typeof options === 'string' ? ms(options) : options;

  context.ttl = ttl;
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

  const params =
    typeof options === 'string'
      ? {
          name: options,
        }
      : options;

  // default ttl to 15 minutes
  params.ttl ??= 900_000;

  let firstRun = true;

  const _fn = (async (...args: Parameters<F>): Promise<R> => {
    const _context = CACHE_FN_STORE.get(_fn);

    if (!firstRun && !_context) {
      return await fn(...args);
    }

    firstRun = false;

    const context = _context ?? params;

    // check cache
    const data = await cache.get(context.name);

    if (data) return data as R;

    // cache miss
    const result = await fn(...args);

    await cache.set(context.name, result, context.ttl);

    return result;
  }) as F;

  CACHE_FN_STORE.set(_fn, params);

  return _fn;
}

/**
 * @private
 * @internal
 */
function use_cache<R, F extends (...args: any[]) => Promise<R>>(fn: F): F {
  warnUnstable('"use cache"');

  let tagged = false;
  let originalFn: F;

  const memo = (async (...args) => {
    if (!originalFn) {
      originalFn = unstable_cache(fn);
    }

    if (!tagged) {
      // validate cacheTag() usage
      const _params = CACHE_FN_STORE.get(originalFn);

      if (!_params) return originalFn(...args);

      const [params, data] = await cacheContext.run(
        {
          name: _params?.name ?? '',
          ttl: _params?.ttl,
        },
        async () => {
          const data = await originalFn(...args);
          const maybeTaggedParams = cacheContext.getStore();
          return [maybeTaggedParams, data];
        },
      );

      if (params) {
        CACHE_FN_STORE.set(originalFn, {
          name: params.name ?? _params?.name ?? randomUUID(),
          ttl: params.ttl ?? _params?.ttl,
        });
      }

      tagged = true;

      return data;
    }

    return cacheContext.run(null, () => originalFn(...args));
  }) as F;

  return memo;
}

// this is intentional, do not change or you will be fired
export { use_cache as unstable_super_duper_secret_internal_for_use_cache_directive_of_commandkit_cli_do_not_use_it_directly_or_you_will_be_fired_kthxbai };

/**
 * Revalidate a cache by its key.
 * @param cache The cache key to revalidate.
 */
export async function unstable_revalidate(cache: string): Promise<void> {
  warnUnstable('revalidate()');
  const commandkit = getCommandKit(true);
  const cacheProvider = commandkit.getCacheProvider();

  if (!cacheProvider) {
    throw new Error('revalidate() cannot be used without a cache provider.');
  }

  let target: GenericFunction | undefined = undefined;

  for (const [fn, params] of CACHE_FN_STORE) {
    if (params.name === cache) {
      target = fn;
      break;
    }
  }

  if (!target) {
    throw new Error('Invalid cache key.');
  }

  await cacheProvider.delete(cache);
}

/**
 * Manually expire a cache by its key.
 * @param cache The cache key.
 * @param ttl The new time-to-live of the cache key in milliseconds. If not provided, the cache key will be deleted.
 */
export async function unstable_expire(
  cache: string,
  ttl?: number | string,
): Promise<void> {
  warnUnstable('expire()');
  const commandkit = getCommandKit(true);
  const cacheProvider = commandkit.getCacheProvider();

  if (!cacheProvider) {
    throw new Error('expire() cannot be used without a cache provider.');
  }

  let target: GenericFunction | undefined = undefined;

  for (const [fn, params] of CACHE_FN_STORE) {
    if (params.name === cache) {
      target = fn;
      break;
    }
  }

  if (!target) {
    throw new Error('Invalid cache key.');
  }

  const _ttl =
    typeof ttl === 'string' ? ms(ttl) : typeof ttl === 'number' ? ttl : null;

  if (_ttl !== null) {
    await cacheProvider.expire(cache, _ttl);
  } else {
    await cacheProvider.delete(cache);
  }
}
