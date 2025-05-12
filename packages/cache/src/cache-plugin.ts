import { Logger, RuntimePlugin } from 'commandkit';
import type { CacheProvider } from './cache-provider';
import { MemoryCache } from './memory-cache';

let cacheProvider: CacheProvider | null = null;

export function setCacheProvider(provider: CacheProvider) {
  cacheProvider = provider;
}

export function getCacheProvider(): CacheProvider {
  if (!cacheProvider) {
    throw new Error('Cache provider is not set. Please set a cache provider.');
  }

  return cacheProvider;
}

export class CachePlugin extends RuntimePlugin {
  public name = 'CommandKitCachePlugin';

  public async activate() {
    if (!cacheProvider) {
      cacheProvider = new MemoryCache();
    }

    Logger.info('CommandKit CachePlugin has been activated!');
  }

  public async deactivate() {
    cacheProvider = null;
  }
}
