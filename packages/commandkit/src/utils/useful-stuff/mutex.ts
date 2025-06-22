/**
 * Async mutex implementation for coordinating access to shared resources.
 * Provides mutual exclusion to ensure only one task can access a resource at a time.
 */

/**
 * Interface for mutex storage implementations.
 * Provides methods to store, retrieve, and delete mutex lock data.
 */
export interface MutexStorage {
  /**
   * Attempts to acquire a lock for a given key
   * @param key - The unique identifier for the mutex lock
   * @param timeout - Optional timeout in milliseconds for the lock
   * @param signal - Optional AbortSignal for cancelling the acquisition
   * @returns Promise resolving to true if lock was acquired, false if timeout or already locked
   */
  acquire(
    key: string,
    timeout?: number,
    signal?: AbortSignal,
  ): Promise<boolean>;

  /**
   * Releases the lock for a given key
   * @param key - The unique identifier for the mutex lock
   * @returns Promise that resolves when the lock is released
   */
  release(key: string): Promise<void>;

  /**
   * Checks if a lock is currently held for a given key
   * @param key - The unique identifier for the mutex lock
   * @returns Promise resolving to true if the lock is held, false otherwise
   */
  isLocked(key: string): Promise<boolean>;
}

/**
 * Configuration options for mutex
 */
export interface MutexOptions {
  /** Default timeout in milliseconds for lock acquisition. Default: 30000 */
  timeout?: number;
  /** Storage implementation for persisting mutex data. Default: {@link MemoryMutexStorage} */
  storage?: MutexStorage;
}

/**
 * In-memory storage implementation for mutex locks.
 * Suitable for single-instance applications.
 */
export class MemoryMutexStorage implements MutexStorage {
  private readonly locks = new Map<
    string,
    { holder: string; acquiredAt: number }
  >();

  /**
   * Attempts to acquire a lock for a given key
   * @param key - The unique identifier for the mutex lock
   * @param timeout - Optional timeout in milliseconds for the lock
   * @param signal - Optional AbortSignal for cancelling the acquisition
   * @returns Promise resolving to true if lock was acquired, false if timeout or already locked
   */
  async acquire(
    key: string,
    timeout: number = 30000,
    signal?: AbortSignal,
  ): Promise<boolean> {
    const holder = this.generateHolderId();
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      // Check if aborted
      if (signal?.aborted) {
        throw new Error('Lock acquisition was aborted');
      }

      if (!this.locks.has(key)) {
        this.locks.set(key, { holder, acquiredAt: Date.now() });
        return true;
      }
      await this.delay(10);
    }

    return false;
  }

  /**
   * Releases the lock for a given key
   * @param key - The unique identifier for the mutex lock
   * @returns Promise that resolves when the lock is released
   */
  async release(key: string): Promise<void> {
    this.locks.delete(key);
  }

  /**
   * Checks if a lock is currently held for a given key
   * @param key - The unique identifier for the mutex lock
   * @returns Promise resolving to true if the lock is held, false otherwise
   */
  async isLocked(key: string): Promise<boolean> {
    return this.locks.has(key);
  }

  private generateHolderId(): string {
    return `holder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Async mutex implementation that provides mutual exclusion for shared resources.
 * Ensures only one task can access a protected resource at a time.
 */
export class Mutex {
  private storage: MutexStorage;
  private readonly defaultTimeout: number;

  /**
   * Creates a new mutex instance
   * @param options - Configuration options for the mutex
   */
  public constructor(options: MutexOptions = {}) {
    this.storage = options.storage || new MemoryMutexStorage();
    this.defaultTimeout = options.timeout || 30000;
  }

  /**
   * Sets the storage implementation for the mutex
   * @param storage - The storage implementation to use
   */
  public setStorage(storage: MutexStorage) {
    this.storage = storage;
  }

  /**
   * Gets the storage implementation for the mutex
   * @returns The storage implementation
   */
  public getStorage(): MutexStorage {
    return this.storage;
  }

  /**
   * Acquires a lock for the given key
   * @param key - The unique identifier for the mutex lock
   * @param timeout - Optional timeout in milliseconds for lock acquisition
   * @param signal - Optional AbortSignal for cancelling the acquisition
   * @returns Promise resolving to true if lock was acquired, false if timeout
   */
  public async acquire(
    key: string,
    timeout?: number,
    signal?: AbortSignal,
  ): Promise<boolean> {
    return this.storage.acquire(key, timeout || this.defaultTimeout, signal);
  }

  /**
   * Releases the lock for the given key
   * @param key - The unique identifier for the mutex lock
   * @returns Promise that resolves when the lock is released
   */
  public async release(key: string): Promise<void> {
    return this.storage.release(key);
  }

  /**
   * Checks if a lock is currently held for the given key
   * @param key - The unique identifier for the mutex lock
   * @returns Promise resolving to true if the lock is held, false otherwise
   */
  public async isLocked(key: string): Promise<boolean> {
    return this.storage.isLocked(key);
  }

  /**
   * Executes a function with exclusive access to the resource
   * @param key - The unique identifier for the mutex lock
   * @param fn - The function to execute with exclusive access
   * @param timeout - Optional timeout in milliseconds for lock acquisition
   * @param signal - Optional AbortSignal for cancelling the lock acquisition
   * @returns Promise resolving to the result of the function execution
   * @throws Error if lock acquisition fails or function execution fails
   */
  public async withLock<T>(
    key: string,
    fn: () => Promise<T> | T,
    timeout?: number,
    signal?: AbortSignal,
  ): Promise<T> {
    const acquired = await this.acquire(key, timeout, signal);
    if (!acquired) {
      throw new Error(`Failed to acquire lock for key: ${key}`);
    }

    try {
      return await fn();
    } finally {
      await this.release(key);
    }
  }

  /**
   * Gets the current configuration of the mutex
   * @returns Object containing the current timeout value
   */
  public getConfig(): Omit<MutexOptions, 'storage'> {
    return {
      timeout: this.defaultTimeout,
    };
  }
}

/**
 * Default mutex instance for global use
 */
export const defaultMutex = new Mutex();

/**
 * Convenience function to execute a function with exclusive access using the default mutex.
 *
 * @param key - The unique identifier for the mutex lock
 * @param fn - The function to execute with exclusive access
 * @param timeout - Optional timeout in milliseconds for lock acquisition
 * @param signal - Optional AbortSignal for cancelling the lock acquisition
 * @returns Promise resolving to the result of the function execution
 *
 * @example
 * ```typescript
 * const controller = new AbortController();
 * const result = await withMutex('shared-resource', async () => {
 *   // This code runs with exclusive access
 *   return await updateSharedResource();
 * }, 30000, controller.signal);
 * controller.abort(); // Cancels the lock acquisition
 * ```
 */
export async function withMutex<T>(
  key: string,
  fn: () => Promise<T> | T,
  timeout?: number,
  signal?: AbortSignal,
): Promise<T> {
  return defaultMutex.withLock(key, fn, timeout, signal);
}

/**
 * Creates a new mutex instance with the specified configuration
 * @param options - Configuration options for the mutex
 * @returns New Mutex instance
 *
 * @example
 * ```typescript
 * const mutex = createMutex({
 *   timeout: 60000,
 *   storage: new RedisMutexStorage()
 * });
 * ```
 */
export function createMutex(options: MutexOptions): Mutex {
  return new Mutex(options);
}

/**
 * Acquires a lock using the default mutex
 * @param key - The unique identifier for the mutex lock
 * @param timeout - Optional timeout in milliseconds for lock acquisition
 * @param signal - Optional AbortSignal for cancelling the acquisition
 * @returns Promise resolving to true if lock was acquired, false if timeout
 */
export async function acquireLock(
  key: string,
  timeout?: number,
  signal?: AbortSignal,
): Promise<boolean> {
  return defaultMutex.acquire(key, timeout, signal);
}

/**
 * Releases a lock using the default mutex
 * @param key - The unique identifier for the mutex lock
 * @returns Promise that resolves when the lock is released
 */
export async function releaseLock(key: string): Promise<void> {
  return defaultMutex.release(key);
}

/**
 * Checks if a lock is held using the default mutex
 * @param key - The unique identifier for the mutex lock
 * @returns Promise resolving to true if the lock is held, false otherwise
 */
export async function isLocked(key: string): Promise<boolean> {
  return defaultMutex.isLocked(key);
}
