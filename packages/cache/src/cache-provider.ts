/**
 * CacheProvider entry
 */
export interface CacheEntry<T = unknown> {
  /**
   * The value stored in the cache entry.
   */
  value: T;
  /**
   * The time when the cache entry was created.
   */
  ttl?: number;
}

/**
 * Abstract class for cache providers.
 * This class defines the methods that any cache provider must implement.
 */
export abstract class CacheProvider {
  /**
   * Retrieves a value from the cache by its key.
   * @param key The key of the cache entry to retrieve.
   * @returns A promise that resolves to the cache entry if found, or undefined if not found.
   */
  abstract get<T>(key: string): Promise<CacheEntry<T> | undefined>;
  /**
   * Sets a value in the cache with an optional time-to-live (TTL).
   * @param key The key under which to store the cache entry.
   * @param value The value to store in the cache.
   * @param ttl Optional time-to-live in seconds for the cache entry.
   */
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
  /**
   * Checks if a cache entry exists by its key.
   * @param key The key of the cache entry to check.
   * @returns A promise that resolves to true if the entry exists, false otherwise.
   */
  abstract exists(key: string): Promise<boolean>;
  /**
   * Deletes a cache entry by its key.
   * @param key The key of the cache entry to delete.
   */
  abstract delete(key: string): Promise<void>;
  /**
   * Clears all entries in the cache.
   * @returns A promise that resolves when the cache is cleared.
   */
  abstract clear(): Promise<void>;
  /**
   * Expires a cache entry by its key after a specified time-to-live (TTL).
   * @param key The key of the cache entry to expire.
   * @param ttl The time-to-live in seconds after which the entry should expire.
   */
  abstract expire(key: string, ttl: number): Promise<void>;
}
