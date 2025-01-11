import { CacheProvider } from './CacheProvider';

export interface MemoryCacheEntry {
  key: string;
  value: any;
  ttl?: number;
}

export class MemoryCache extends CacheProvider {
  #cache = new Map<string, MemoryCacheEntry>();

  public async get<T>(key: string): Promise<T | undefined> {
    const entry = this.#cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.ttl && Date.now() > entry.ttl) {
      this.#cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.#cache.set(key, {
      key,
      value,
      ttl: ttl != null ? Date.now() + ttl : undefined,
    });
  }

  public async exists(key: string): Promise<boolean> {
    return this.#cache.has(key);
  }

  public async delete(key: string): Promise<void> {
    this.#cache.delete(key);
  }

  public async clear(): Promise<void> {
    this.#cache.clear();
  }
}
