/**
 * Default timeout interval for rate limiting in milliseconds
 */
export const DEFAULT_TIMEOUT = 60000;

/**
 * Default maximum number of requests allowed per interval
 */
export const DEFAULT_MAX_REQUESTS = 10;

/**
 * Interface for rate limit storage implementations.
 * Provides methods to store, retrieve, and delete rate limit data.
 */
export interface RateLimitStorage {
  /**
   * Retrieves the current request count for a given key
   * @param key - The unique identifier for the rate limit entry
   * @returns Promise resolving to the current request count
   */
  get(key: string): Promise<number>;

  /**
   * Sets the request count for a given key
   * @param key - The unique identifier for the rate limit entry
   * @param value - The request count to store
   * @returns Promise that resolves when the value is stored
   */
  set(key: string, value: number): Promise<void>;

  /**
   * Deletes the rate limit entry for a given key
   * @param key - The unique identifier for the rate limit entry
   * @returns Promise that resolves when the entry is deleted
   */
  delete(key: string): Promise<void>;
}

/**
 * Configuration options for rate limiting
 */
export interface RateLimitOptions {
  /** Maximum number of requests allowed per interval. Default: 10 */
  maxRequests?: number;
  /** Time interval in milliseconds for the rate limit window. Default: 60000 */
  interval?: number;
  /** Storage implementation for persisting rate limit data. Default: {@link MemoryRateLimitStorage} */
  storage?: RateLimitStorage;
}

/**
 * In-memory storage implementation for rate limiting.
 * Suitable for single-instance applications.
 */
export class MemoryRateLimitStorage implements RateLimitStorage {
  private readonly store = new Map<string, number>();

  /**
   * Retrieves the current request count for a given key
   * @param key - The unique identifier for the rate limit entry
   * @returns Promise resolving to the current request count or 0 if not found
   */
  async get(key: string): Promise<number> {
    return this.store.get(key) || 0;
  }

  /**
   * Sets the request count for a given key
   * @param key - The unique identifier for the rate limit entry
   * @param value - The request count to store
   * @returns Promise that resolves immediately
   */
  async set(key: string, value: number): Promise<void> {
    this.store.set(key, value);
  }

  /**
   * Deletes the rate limit entry for a given key
   * @param key - The unique identifier for the rate limit entry
   * @returns Promise that resolves immediately
   */
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

/**
 * Rate limiter implementation that enforces request limits per key.
 * Supports configurable request limits and time intervals.
 */
export class RateLimiter {
  private readonly limits: Map<string, number> = new Map();
  private readonly lastReset: Map<string, number> = new Map();
  private readonly resetInterval: number;

  /**
   * Creates a new rate limiter instance
   * @param maxRequests - Maximum number of requests allowed per interval (default: 10)
   * @param interval - Time interval in milliseconds for the rate limit window (default: 60000)
   * @param storage - Optional storage implementation (default: MemoryRateLimitStorage)
   */
  public constructor(
    private readonly maxRequests: number = DEFAULT_MAX_REQUESTS,
    private readonly interval: number = DEFAULT_TIMEOUT,
    private storage: RateLimitStorage = new MemoryRateLimitStorage(),
  ) {
    this.resetInterval = interval;
  }

  /**
   * Sets the storage implementation for the rate limiter
   * @param storage - The storage implementation to use
   */
  public setStorage(storage: RateLimitStorage) {
    this.storage = storage;
  }

  /**
   * Gets the storage implementation for the rate limiter
   * @returns The storage implementation
   */
  public getStorage(): RateLimitStorage {
    return this.storage;
  }

  /**
   * Checks if a request is allowed for the given key and increments the counter if allowed
   * @param key - The unique identifier for the rate limit entry
   * @returns Promise resolving to true if the request is allowed, false if rate limited
   */
  public async limit(key: string): Promise<boolean> {
    const now = Date.now();
    const lastReset = this.lastReset.get(key) || 0;
    const timeSinceReset = now - lastReset;

    // Reset counter if interval has passed
    if (timeSinceReset > this.resetInterval) {
      await this.storage.delete(key);
      this.lastReset.set(key, now);
      this.limits.set(key, 0);
    }

    // Get current count from storage
    const currentCount = await this.storage.get(key);

    // Check if limit exceeded
    if (currentCount >= this.maxRequests) {
      return false;
    }

    // Increment counter
    const newCount = currentCount + 1;
    await this.storage.set(key, newCount);
    this.limits.set(key, newCount);

    return true;
  }

  /**
   * Gets the remaining requests allowed for a given key
   * @param key - The unique identifier for the rate limit entry
   * @returns Promise resolving to the number of remaining requests
   */
  public async getRemaining(key: string): Promise<number> {
    const currentCount = await this.storage.get(key);
    return Math.max(0, this.maxRequests - currentCount);
  }

  /**
   * Gets the time until the rate limit resets for a given key
   * @param key - The unique identifier for the rate limit entry
   * @returns Promise resolving to the time in milliseconds until reset, or 0 if no limit is active
   */
  public async getResetTime(key: string): Promise<number> {
    const lastReset = this.lastReset.get(key) || 0;
    const now = Date.now();
    const timeSinceReset = now - lastReset;

    if (timeSinceReset >= this.resetInterval) {
      return 0;
    }

    return this.resetInterval - timeSinceReset;
  }

  /**
   * Resets the rate limit for a given key
   * @param key - The unique identifier for the rate limit entry
   * @returns Promise that resolves when the reset is complete
   */
  public async reset(key: string): Promise<void> {
    await this.storage.delete(key);
    this.limits.delete(key);
    this.lastReset.delete(key);
  }

  /**
   * Gets the current configuration of the rate limiter
   * @returns Object containing the current maxRequests and interval values
   */
  public getConfig(): Omit<RateLimitOptions, 'storage'> {
    return {
      maxRequests: this.maxRequests,
      interval: this.interval,
    };
  }
}

/**
 * Default rate limiter instance for global use
 */
export const defaultRateLimiter = new RateLimiter();

/**
 * Convenience function to check if a request is allowed for a given key.
 * Uses the default rate limiter instance.
 *
 * @param key - The unique identifier for the rate limit entry
 * @returns Promise resolving to true if the request is allowed, false if rate limited
 *
 * @example
 * ```typescript
 * const allowed = await ratelimit('user:123');
 * // update the default rate limiter config
 * import { defaultRateLimiter } from 'commandkit/ratelimit';
 *
 * // update max allowed requests
 * defaultRateLimiter.setMaxRequests(10);
 *
 * // update the timeout interval
 * defaultRateLimiter.setInterval(30000);
 *
 * // update the storage implementation
 * defaultRateLimiter.setStorage(new RedisStorage());
 * ```
 */
export async function ratelimit(key: string): Promise<boolean> {
  return defaultRateLimiter.limit(key);
}

/**
 * Creates a new rate limiter instance with the specified configuration
 * @param options - Configuration options for the rate limiter
 * @returns New RateLimiter instance
 *
 * @example
 * ```typescript
 * const limiter = createRateLimiter({
 *   maxRequests: 5,
 *   interval: 30000,
 *   storage: new CustomStorage()
 * });
 * ```
 */
export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  return new RateLimiter(
    options.maxRequests,
    options.interval,
    options.storage,
  );
}

/**
 * Gets the remaining requests for a key using the default rate limiter
 * @param key - The unique identifier for the rate limit entry
 * @returns Promise resolving to the number of remaining requests
 */
export async function getRemainingRequests(key: string): Promise<number> {
  return defaultRateLimiter.getRemaining(key);
}

/**
 * Gets the reset time for a key using the default rate limiter
 * @param key - The unique identifier for the rate limit entry
 * @returns Promise resolving to the time in milliseconds until reset
 */
export async function getResetTime(key: string): Promise<number> {
  return defaultRateLimiter.getResetTime(key);
}

/**
 * Resets the rate limit for a key using the default rate limiter
 * @param key - The unique identifier for the rate limit entry
 * @returns Promise that resolves when the reset is complete
 */
export async function resetRateLimit(key: string): Promise<void> {
  return defaultRateLimiter.reset(key);
}
