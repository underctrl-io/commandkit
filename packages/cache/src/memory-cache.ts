import { CacheEntry, CacheProvider } from './cache-provider';

/**
 * MemoryCache is an in-memory cache provider that implements the CacheProvider interface.
 * It stores cache entries in a Map and supports basic operations like get, set, exists, delete, clear, and expire.
 */
export class MemoryCache extends CacheProvider {
  #cache = new Map<string, CacheEntry>();

  /**
   * Retrieves a value from the cache by its key.
   * @param key The key of the cache entry to retrieve.
   * @returns A promise that resolves to the cache entry if found, or undefined if not found.
   */
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

  /**
   * Sets a value in the cache with an optional time-to-live (TTL).
   * @param key The key under which to store the cache entry.
   * @param value The value to store in the cache.
   * @param ttl Optional time-to-live in milliseconds for the cache entry.
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      ttl: ttl != null ? Date.now() + ttl : undefined,
    };

    this.#cache.set(key, entry);
  }

  /**
   * Checks if a cache entry exists by its key.
   * @param key The key of the cache entry to check.
   * @returns A promise that resolves to true if the entry exists, false otherwise.
   */
  public async exists(key: string): Promise<boolean> {
    return this.#cache.has(key);
  }

  /**
   * Deletes a cache entry by its key.
   * @param key The key of the cache entry to delete.
   */
  public async delete(key: string): Promise<void> {
    this.#cache.delete(key);
  }

  /**
   * Clears all entries in the cache.
   * @returns A promise that resolves when the cache is cleared.
   */
  public async clear(): Promise<void> {
    this.#cache.clear();
  }

  /**
   * Expires a cache entry by its key after a specified time-to-live (TTL).
   * @param key The key of the cache entry to expire.
   * @param ttl The time-to-live in milliseconds after which the entry should expire.
   */
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
