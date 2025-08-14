import type { SemaphoreStorage } from 'commandkit/semaphore';
import Redis from 'ioredis';

export class RedisSemaphoreStorage implements SemaphoreStorage {
  private readonly semaphorePrefix = 'semaphore:';
  private readonly defaultTimeout = 30000; // 30 seconds

  public constructor(private readonly redis: Redis) {}

  public async acquire(
    key: string,
    timeout: number = this.defaultTimeout,
    signal?: AbortSignal,
  ): Promise<boolean> {
    const semaphoreKey = this.semaphorePrefix + key;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      // Check if aborted
      if (signal?.aborted) {
        throw new Error('Permit acquisition was aborted');
      }

      // Check if semaphore exists, if not initialize it
      const total = await this.redis.get(semaphoreKey + ':total');
      if (!total) {
        await this.initialize(key, 10); // Default 10 permits
      }

      // Try to decrement available permits
      const available = await this.redis.get(semaphoreKey + ':available');
      const availableCount = Number(available) || 0;

      if (availableCount > 0) {
        // Use DECR to atomically decrease the count
        const newCount = await this.redis.decr(semaphoreKey + ':available');
        if (newCount >= 0) {
          return true;
        } else {
          // If we went negative, increment back
          await this.redis.incr(semaphoreKey + ':available');
        }
      }

      // Wait a bit before trying again
      await this.delay(10);
    }

    return false;
  }

  public async release(key: string): Promise<void> {
    const semaphoreKey = this.semaphorePrefix + key;

    // Get current values
    const total = await this.redis.get(semaphoreKey + ':total');
    const available = await this.redis.get(semaphoreKey + ':available');

    const totalPermits = Number(total) || 0;
    const availablePermits = Number(available) || 0;

    // Only increment if we haven't reached the total
    if (availablePermits < totalPermits) {
      await this.redis.incr(semaphoreKey + ':available');
    }
  }

  public async getAvailablePermits(key: string): Promise<number> {
    const semaphoreKey = this.semaphorePrefix + key;
    const available = await this.redis.get(semaphoreKey + ':available');
    return Number(available) || 0;
  }

  public async getTotalPermits(key: string): Promise<number> {
    const semaphoreKey = this.semaphorePrefix + key;
    const total = await this.redis.get(semaphoreKey + ':total');
    return Number(total) || 0;
  }

  /**
   * Initializes a semaphore with the specified number of permits
   * @param key - The semaphore key
   * @param permits - The total number of permits to allocate
   */
  public async initialize(key: string, permits: number): Promise<void> {
    const semaphoreKey = this.semaphorePrefix + key;

    await this.redis.set(semaphoreKey + ':total', permits);
    await this.redis.set(semaphoreKey + ':available', permits);
  }

  /**
   * Gets detailed information about a semaphore
   * @param key - The semaphore key
   * @returns Object containing semaphore information
   */
  public async getSemaphoreInfo(key: string): Promise<{
    total: number;
    available: number;
    acquired: number;
    initialized: boolean;
  }> {
    const semaphoreKey = this.semaphorePrefix + key;
    const total = await this.redis.get(semaphoreKey + ':total');
    const available = await this.redis.get(semaphoreKey + ':available');

    const totalPermits = Number(total) || 0;
    const availablePermits = Number(available) || 0;

    return {
      total: totalPermits,
      available: availablePermits,
      acquired: totalPermits - availablePermits,
      initialized: totalPermits > 0,
    };
  }

  /**
   * Resets a semaphore to its initial state
   * @param key - The semaphore key
   * @param permits - The number of permits to reset to (optional, uses current total if not provided)
   */
  public async reset(key: string, permits?: number): Promise<void> {
    const semaphoreKey = this.semaphorePrefix + key;

    if (permits !== undefined) {
      await this.initialize(key, permits);
    } else {
      const total = await this.getTotalPermits(key);
      if (total > 0) {
        await this.redis.set(semaphoreKey + ':available', total);
      }
    }
  }

  /**
   * Increases the total number of permits for a semaphore
   * @param key - The semaphore key
   * @param additionalPermits - The number of additional permits to add
   */
  public async increasePermits(
    key: string,
    additionalPermits: number,
  ): Promise<void> {
    const semaphoreKey = this.semaphorePrefix + key;

    const total = await this.redis.get(semaphoreKey + ':total');
    const available = await this.redis.get(semaphoreKey + ':available');

    const totalPermits = Number(total) || 0;
    const availablePermits = Number(available) || 0;

    const newTotal = totalPermits + additionalPermits;
    const newAvailable = availablePermits + additionalPermits;

    await this.redis.set(semaphoreKey + ':total', newTotal);
    await this.redis.set(semaphoreKey + ':available', newAvailable);
  }

  /**
   * Decreases the total number of permits for a semaphore
   * @param key - The semaphore key
   * @param permitsToRemove - The number of permits to remove
   */
  public async decreasePermits(
    key: string,
    permitsToRemove: number,
  ): Promise<void> {
    const semaphoreKey = this.semaphorePrefix + key;

    const total = await this.redis.get(semaphoreKey + ':total');
    const available = await this.redis.get(semaphoreKey + ':available');

    const totalPermits = Number(total) || 0;
    const availablePermits = Number(available) || 0;

    const newTotal = Math.max(0, totalPermits - permitsToRemove);
    const newAvailable = Math.max(0, availablePermits - permitsToRemove);

    await this.redis.set(semaphoreKey + ':total', newTotal);
    await this.redis.set(semaphoreKey + ':available', newAvailable);
  }

  /**
   * Clears a semaphore completely
   * @param key - The semaphore key
   */
  public async clear(key: string): Promise<void> {
    const semaphoreKey = this.semaphorePrefix + key;
    await this.redis.del(semaphoreKey + ':total', semaphoreKey + ':available');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
