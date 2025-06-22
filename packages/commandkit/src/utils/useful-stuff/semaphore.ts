/**
 * Async semaphore implementation for controlling access to a limited pool of resources.
 * Allows a specified number of concurrent operations while blocking additional requests.
 */

/**
 * Interface for semaphore storage implementations.
 * Provides methods to store, retrieve, and manage semaphore permit data.
 */
export interface SemaphoreStorage {
  /**
   * Attempts to acquire a permit for a given key
   * @param key - The unique identifier for the semaphore
   * @param timeout - Optional timeout in milliseconds for permit acquisition
   * @param signal - Optional AbortSignal for cancelling the acquisition
   * @returns Promise resolving to true if permit was acquired, false if timeout or no permits available
   */
  acquire(
    key: string,
    timeout?: number,
    signal?: AbortSignal,
  ): Promise<boolean>;

  /**
   * Releases a permit for a given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise that resolves when the permit is released
   */
  release(key: string): Promise<void>;

  /**
   * Gets the number of available permits for a given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise resolving to the number of available permits
   */
  getAvailablePermits(key: string): Promise<number>;

  /**
   * Gets the total number of permits for a given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise resolving to the total number of permits
   */
  getTotalPermits(key: string): Promise<number>;
}

/**
 * Configuration options for semaphore
 */
export interface SemaphoreOptions {
  /** Maximum number of concurrent permits allowed. Default: 1 */
  permits?: number;
  /** Default timeout in milliseconds for permit acquisition. Default: 30000 */
  timeout?: number;
  /** Storage implementation for persisting semaphore data. Default: {@link MemorySemaphoreStorage} */
  storage?: SemaphoreStorage;
}

/**
 * In-memory storage implementation for semaphore permits.
 * Suitable for single-instance applications.
 */
export class MemorySemaphoreStorage implements SemaphoreStorage {
  private readonly semaphores = new Map<
    string,
    { total: number; available: number }
  >();

  /**
   * Attempts to acquire a permit for a given key
   * @param key - The unique identifier for the semaphore
   * @param timeout - Optional timeout in milliseconds for permit acquisition
   * @param signal - Optional AbortSignal for cancelling the acquisition
   * @returns Promise resolving to true if permit was acquired, false if timeout or no permits available
   */
  async acquire(
    key: string,
    timeout: number = 30000,
    signal?: AbortSignal,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      // Check if aborted
      if (signal?.aborted) {
        throw new Error('Permit acquisition was aborted');
      }

      const semaphore = this.semaphores.get(key);
      if (semaphore && semaphore.available > 0) {
        semaphore.available--;
        return true;
      }
      await this.delay(10);
    }

    return false;
  }

  /**
   * Releases a permit for a given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise that resolves when the permit is released
   */
  async release(key: string): Promise<void> {
    const semaphore = this.semaphores.get(key);
    if (semaphore && semaphore.available < semaphore.total) {
      semaphore.available++;
    }
  }

  /**
   * Gets the number of available permits for a given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise resolving to the number of available permits
   */
  async getAvailablePermits(key: string): Promise<number> {
    const semaphore = this.semaphores.get(key);
    return semaphore ? semaphore.available : 0;
  }

  /**
   * Gets the total number of permits for a given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise resolving to the total number of permits
   */
  async getTotalPermits(key: string): Promise<number> {
    const semaphore = this.semaphores.get(key);
    return semaphore ? semaphore.total : 0;
  }

  /**
   * Initializes a semaphore with the specified number of permits
   * @param key - The unique identifier for the semaphore
   * @param permits - The total number of permits to allocate
   */
  initialize(key: string, permits: number): void {
    this.semaphores.set(key, { total: permits, available: permits });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Async semaphore implementation that controls access to a limited pool of resources.
 * Allows a specified number of concurrent operations while blocking additional requests.
 */
export class Semaphore {
  private storage: SemaphoreStorage;
  private readonly defaultPermits: number;
  private readonly defaultTimeout: number;

  /**
   * Creates a new semaphore instance
   * @param options - Configuration options for the semaphore
   */
  public constructor(options: SemaphoreOptions = {}) {
    this.storage = options.storage || new MemorySemaphoreStorage();
    this.defaultPermits = options.permits || 1;
    this.defaultTimeout = options.timeout || 30000;
  }

  /**
   * Sets the storage implementation for the semaphore
   * @param storage - The storage implementation to use
   */
  public setStorage(storage: SemaphoreStorage) {
    this.storage = storage;
  }

  /**
   * Gets the storage implementation for the semaphore
   * @returns The storage implementation
   */
  public getStorage(): SemaphoreStorage {
    return this.storage;
  }

  /**
   * Acquires a permit for the given key
   * @param key - The unique identifier for the semaphore
   * @param timeout - Optional timeout in milliseconds for permit acquisition
   * @param signal - Optional AbortSignal for cancelling the acquisition
   * @returns Promise resolving to true if permit was acquired, false if timeout
   */
  public async acquire(
    key: string,
    timeout?: number,
    signal?: AbortSignal,
  ): Promise<boolean> {
    // Initialize semaphore if it doesn't exist
    if (this.storage instanceof MemorySemaphoreStorage) {
      const totalPermits = await this.storage.getTotalPermits(key);
      if (totalPermits === 0) {
        (this.storage as MemorySemaphoreStorage).initialize(
          key,
          this.defaultPermits,
        );
      }
    }

    return this.storage.acquire(key, timeout || this.defaultTimeout, signal);
  }

  /**
   * Releases a permit for the given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise that resolves when the permit is released
   */
  public async release(key: string): Promise<void> {
    return this.storage.release(key);
  }

  /**
   * Gets the number of available permits for the given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise resolving to the number of available permits
   */
  public async getAvailablePermits(key: string): Promise<number> {
    return this.storage.getAvailablePermits(key);
  }

  /**
   * Gets the total number of permits for the given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise resolving to the total number of permits
   */
  public async getTotalPermits(key: string): Promise<number> {
    return this.storage.getTotalPermits(key);
  }

  /**
   * Gets the number of acquired permits for the given key
   * @param key - The unique identifier for the semaphore
   * @returns Promise resolving to the number of acquired permits
   */
  public async getAcquiredPermits(key: string): Promise<number> {
    const total = await this.getTotalPermits(key);
    const available = await this.getAvailablePermits(key);
    return total - available;
  }

  /**
   * Executes a function with a permit from the semaphore
   * @param key - The unique identifier for the semaphore
   * @param fn - The function to execute with a permit
   * @param timeout - Optional timeout in milliseconds for permit acquisition
   * @param signal - Optional AbortSignal for cancelling the permit acquisition
   * @returns Promise resolving to the result of the function execution
   * @throws Error if permit acquisition fails or function execution fails
   */
  public async withPermit<T>(
    key: string,
    fn: () => Promise<T> | T,
    timeout?: number,
    signal?: AbortSignal,
  ): Promise<T> {
    const acquired = await this.acquire(key, timeout, signal);
    if (!acquired) {
      throw new Error(`Failed to acquire permit for key: ${key}`);
    }

    try {
      return await fn();
    } finally {
      await this.release(key);
    }
  }

  /**
   * Gets the current configuration of the semaphore
   * @returns Object containing the current permits and timeout values
   */
  public getConfig(): Omit<SemaphoreOptions, 'storage'> {
    return {
      permits: this.defaultPermits,
      timeout: this.defaultTimeout,
    };
  }
}

/**
 * Default semaphore instance for global use
 */
export const defaultSemaphore = new Semaphore();

/**
 * Convenience function to execute a function with a permit using the default semaphore.
 *
 * @param key - The unique identifier for the semaphore
 * @param fn - The function to execute with a permit
 * @param timeout - Optional timeout in milliseconds for permit acquisition
 * @param signal - Optional AbortSignal for cancelling the permit acquisition
 * @returns Promise resolving to the result of the function execution
 *
 * @example
 * ```typescript
 * const controller = new AbortController();
 * const result = await withPermit('database-connection', async () => {
 *   // This code runs with a permit from the semaphore
 *   return await executeDatabaseQuery();
 * }, 30000, controller.signal);
 * controller.abort(); // Cancels the permit acquisition
 * ```
 */
export async function withPermit<T>(
  key: string,
  fn: () => Promise<T> | T,
  timeout?: number,
  signal?: AbortSignal,
): Promise<T> {
  return defaultSemaphore.withPermit(key, fn, timeout, signal);
}

/**
 * Creates a new semaphore instance with the specified configuration
 * @param options - Configuration options for the semaphore
 * @returns New Semaphore instance
 *
 * @example
 * ```typescript
 * const semaphore = createSemaphore({
 *   permits: 5,
 *   timeout: 60000,
 *   storage: new RedisSemaphoreStorage()
 * });
 * ```
 */
export function createSemaphore(options: SemaphoreOptions): Semaphore {
  return new Semaphore(options);
}

/**
 * Acquires a permit using the default semaphore
 * @param key - The unique identifier for the semaphore
 * @param timeout - Optional timeout in milliseconds for permit acquisition
 * @param signal - Optional AbortSignal for cancelling the acquisition
 * @returns Promise resolving to true if permit was acquired, false if timeout
 */
export async function acquirePermit(
  key: string,
  timeout?: number,
  signal?: AbortSignal,
): Promise<boolean> {
  return defaultSemaphore.acquire(key, timeout, signal);
}

/**
 * Releases a permit using the default semaphore
 * @param key - The unique identifier for the semaphore
 * @returns Promise that resolves when the permit is released
 */
export async function releasePermit(key: string): Promise<void> {
  return defaultSemaphore.release(key);
}

/**
 * Gets the number of available permits using the default semaphore
 * @param key - The unique identifier for the semaphore
 * @returns Promise resolving to the number of available permits
 */
export async function getAvailablePermits(key: string): Promise<number> {
  return defaultSemaphore.getAvailablePermits(key);
}

/**
 * Gets the number of acquired permits using the default semaphore
 * @param key - The unique identifier for the semaphore
 * @returns Promise resolving to the number of acquired permits
 */
export async function getAcquiredPermits(key: string): Promise<number> {
  return defaultSemaphore.getAcquiredPermits(key);
}
