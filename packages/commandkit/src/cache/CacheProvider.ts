export interface CacheEntry {
  key: string;
  value: any;
  ttl?: number;
}

export abstract class CacheProvider {
  abstract get(key: string): Promise<CacheEntry | undefined>;
  abstract set(key: string, value: any, ttl?: number): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract expire(key: string, ttl: number): Promise<void>;
}
