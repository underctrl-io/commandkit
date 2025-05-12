export interface CacheEntry<T = unknown> {
  value: T;
  ttl?: number;
}

export abstract class CacheProvider {
  abstract get<T>(key: string): Promise<CacheEntry<T> | undefined>;
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract expire(key: string, ttl: number): Promise<void>;
}
