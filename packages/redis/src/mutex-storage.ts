import type { MutexStorage } from 'commandkit/mutex';
import Redis from 'ioredis';

export class RedisMutexStorage implements MutexStorage {
  private readonly lockPrefix = 'mutex:';
  private readonly defaultTimeout = 30000; // 30 seconds

  public constructor(private readonly redis: Redis) {}

  public async acquire(
    key: string,
    timeout: number = this.defaultTimeout,
    signal?: AbortSignal,
  ): Promise<boolean> {
    const lockKey = this.lockPrefix + key;
    const lockValue = this.generateLockValue();
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      // Check if aborted
      if (signal?.aborted) {
        throw new Error('Lock acquisition was aborted');
      }

      // Try to acquire the lock using SET with NX (only if not exists) and EX (expiration)
      const result = await this.redis.set(
        lockKey,
        lockValue,
        'EX',
        Math.ceil(timeout / 1000), // Convert to seconds
        'NX',
      );

      if (result === 'OK') {
        return true;
      }

      // Wait a bit before trying again
      await this.delay(10);
    }

    return false;
  }

  public async release(key: string): Promise<void> {
    const lockKey = this.lockPrefix + key;

    // Simple delete - in a real scenario, you might want to check ownership
    // but for simplicity, we'll just delete the key
    await this.redis.del(lockKey);
  }

  public async isLocked(key: string): Promise<boolean> {
    const lockKey = this.lockPrefix + key;
    const exists = await this.redis.exists(lockKey);
    return exists === 1;
  }

  /**
   * Gets information about a lock including its TTL
   * @param key - The lock key
   * @returns Object containing lock information
   */
  public async getLockInfo(key: string): Promise<{
    locked: boolean;
    ttl: number;
    value?: string;
  }> {
    const lockKey = this.lockPrefix + key;
    const exists = await this.redis.exists(lockKey);

    if (exists === 0) {
      return { locked: false, ttl: 0 };
    }

    const ttl = await this.redis.ttl(lockKey);
    const value = await this.redis.get(lockKey);

    return {
      locked: true,
      ttl: ttl > 0 ? ttl * 1000 : 0, // Convert to milliseconds
      value: value || undefined,
    };
  }

  /**
   * Force releases a lock (use with caution)
   * @param key - The lock key
   */
  public async forceRelease(key: string): Promise<void> {
    const lockKey = this.lockPrefix + key;
    await this.redis.del(lockKey);
  }

  /**
   * Extends the lock timeout
   * @param key - The lock key
   * @param additionalTime - Additional time in milliseconds
   * @returns True if lock was extended, false if lock doesn't exist
   */
  public async extendLock(
    key: string,
    additionalTime: number,
  ): Promise<boolean> {
    const lockKey = this.lockPrefix + key;
    const exists = await this.redis.exists(lockKey);

    if (exists === 0) {
      return false;
    }

    const result = await this.redis.expire(
      lockKey,
      Math.ceil(additionalTime / 1000),
    );
    return result === 1;
  }

  private generateLockValue(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
