import type { RateLimitStorage } from 'commandkit/ratelimit';
import Redis from 'ioredis';

export class RedisRateLimitStorage implements RateLimitStorage {
  public constructor(private readonly redis: Redis) {}

  public async get(key: string): Promise<number> {
    return Number(await this.redis.get(key)) || 0;
  }

  public async set(key: string, value: number): Promise<void> {
    await this.redis.set(key, value);
  }

  public async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
