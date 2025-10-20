import { redis } from '@/redis/redis';

export async function isRateLimited(key: string, time: number) {
  const exists = await redis.get(key);

  if (exists != null) return true;

  // set with expiration ttl where time is in milliseconds
  await redis.set(key, '1', 'PX', time);

  return false;
}
