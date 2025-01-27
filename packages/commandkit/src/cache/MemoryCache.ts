import { CacheEntry, CacheProvider } from './CacheProvider';

export class MemoryCache extends CacheProvider {
  #cache = new Map<string, CacheEntry>();

  public async get<T>(key: string): Promise<CacheEntry<T> | undefined> {
    const entry = this.#cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.ttl && Date.now() > entry.ttl) {
      this.#cache.delete(key);
      return undefined;
    }

    return entry as CacheEntry<T>;
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      ttl: ttl != null ? Date.now() + ttl : undefined,
    };

    this.#cache.set(key, entry);
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

  public async expire(key: string, ttl: number): Promise<void> {
    const entry = this.#cache.get(key);

    if (!entry) return;

    const _ttl = Date.now() + ttl;

    // delete if _ttl is in the past
    if (_ttl < Date.now()) {
      this.#cache.delete(key);
      return;
    }

    entry.ttl = _ttl;
  }
}
