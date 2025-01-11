export abstract class CacheProvider {
  abstract get<T>(key: string): Promise<T | undefined>;
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
}
