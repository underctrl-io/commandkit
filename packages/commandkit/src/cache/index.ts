import { InteractionResponse, Message } from 'discord.js';
import { useEnvironment } from '../context/async-context';
import { after } from '../context/environment';
import { CommandKitErrorCodes } from '../utils/error-codes';
import { warnUnstable } from '../utils/warn-unstable';

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
 * Cache a value.
 * @param options The cache options.
 */
export async function unstable_cache(options: string): Promise<void>;
export async function unstable_cache(options: CacheOptions): Promise<void>;
export async function unstable_cache(
  options: string | CacheOptions,
): Promise<void> {
  warnUnstable('unstable_cache()');
  const env = useEnvironment();
  const commandkit = env.commandkit;
  const cache = commandkit.getCacheProvider();

  if (!cache) {
    throw new Error('cache() cannot be used without a cache provider.');
  }

  const params = typeof options === 'string' ? { name: options } : options;

  // check cache
  const data = await cache.get(params.name);

  if (data) {
    const error = new Error('Cache hit exception');
    Reflect.set(error, 'data', data);
    Reflect.set(error, 'code', CommandKitErrorCodes.CacheHit);

    throw error;
  }

  env.captureResult();

  after(async (env) => {
    try {
      const result = await env.getResult();

      if (result == null) return;

      if (result instanceof InteractionResponse) {
        const message = await result.fetch();
        await cache.set(
          params.name,
          {
            content: message.content,
            embeds: message.embeds,
            components: message.components,
          },
          params.ttl,
        );
      } else if (result instanceof Message) {
        await cache.set(
          params.name,
          {
            content: result.content,
            embeds: result.embeds,
            components: result.components,
          },
          params.ttl,
        );
      } else {
        const json = 'toJSON' in result ? result.toJSON() : result;

        await cache.set(params.name, json, params.ttl);
      }
    } catch (e) {
      commandkit.emit('cacheError', e);
    }
  });
}

/**
 * Manually expire a cache by its key.
 * @param name The name of the cache key.
 */
export async function unstable_expire(name: string): Promise<void> {
  warnUnstable('unstable_expire()');
  const env = useEnvironment();
  const commandkit = env.commandkit;
  const cache = commandkit.getCacheProvider();

  if (!cache) {
    throw new Error('expire() cannot be used without a cache provider.');
  }

  await cache.delete(name);
}
