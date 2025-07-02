import { DatabaseSync, StatementSync } from 'node:sqlite';

/**
 * Configuration options for the KV store
 */
export interface KvOptions {
  /** Enable Write-Ahead Logging for better performance and durability */
  enableWAL?: boolean;
  /** Namespace for the key-value store table */
  namespace?: string;
}

/**
 * A key-value store implementation using SQLite
 *
 * This class provides a simple, persistent key-value storage solution
 * with support for namespaces, automatic cleanup, iteration, and expiration.
 *
 * @example
 * ```typescript
 * const kv = new KV('data.db');
 * kv.set('user:123', JSON.stringify({ name: 'John', age: 30 }));
 * const user = JSON.parse(kv.get('user:123') || '{}');
 *
 * // Using namespaces
 * const userKv = kv.namespace('users');
 * userKv.set('123', JSON.stringify({ name: 'John' }));
 * ```
 */
export class KV implements Disposable, AsyncDisposable {
  private db: DatabaseSync;
  private statements: Record<string, StatementSync> = {};

  /**
   * Creates a new KV store instance
   *
   * @param path - Database file path, buffer, URL, or existing DatabaseSync instance
   * @param options - Configuration options for the KV store
   */
  public constructor(
    path: string | Buffer | URL | DatabaseSync,
    private options: KvOptions = {
      enableWAL: true,
      namespace: 'commandkit_kv',
    },
  ) {
    this.db =
      path instanceof DatabaseSync
        ? path
        : new DatabaseSync(path, { open: true });

    if (options.enableWAL) {
      this.db.exec(/* sql */ `PRAGMA journal_mode = WAL;`);
    }

    this.db
      .prepare(
        /* sql */ `
      CREATE TABLE IF NOT EXISTS ? (
        key TEXT PRIMARY KEY,
        value TEXT,
        expires_at INTEGER
      )
    `,
      )
      .run(options.namespace ?? 'commandkit_kv');

    this.statements = {
      get: this.db.prepare(
        /* sql */ `SELECT value, expires_at FROM ? WHERE key = ?`,
      ),
      set: this.db.prepare(
        /* sql */ `INSERT OR REPLACE INTO ? (key, value, expires_at) VALUES (?, ?, ?)`,
      ),
      setex: this.db.prepare(
        /* sql */ `INSERT OR REPLACE INTO ? (key, value, expires_at) VALUES (?, ?, ?)`,
      ),
      delete: this.db.prepare(/* sql */ `DELETE FROM ? WHERE key = ?`),
      has: this.db.prepare(
        /* sql */ `SELECT COUNT(*) FROM ? WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)`,
      ),
      keys: this.db.prepare(
        /* sql */ `SELECT key FROM ? WHERE expires_at IS NULL OR expires_at > ?`,
      ),
      values: this.db.prepare(
        /* sql */ `SELECT value FROM ? WHERE expires_at IS NULL OR expires_at > ?`,
      ),
      clear: this.db.prepare(/* sql */ `DELETE FROM ?`),
      count: this.db.prepare(
        /* sql */ `SELECT COUNT(*) FROM ? WHERE expires_at IS NULL OR expires_at > ?`,
      ),
      all: this.db.prepare(
        /* sql */ `SELECT key, value FROM ? WHERE expires_at IS NULL OR expires_at > ?`,
      ),
      expire: this.db.prepare(
        /* sql */ `UPDATE ? SET expires_at = ? WHERE key = ?`,
      ),
      ttl: this.db.prepare(/* sql */ `SELECT expires_at FROM ? WHERE key = ?`),
      namespaces: this.db.prepare(
        /* sql */ `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`,
      ),
      begin: this.db.prepare(/* sql */ `BEGIN TRANSACTION`),
      commit: this.db.prepare(/* sql */ `COMMIT`),
      rollback: this.db.prepare(/* sql */ `ROLLBACK`),
    };
  }

  /**
   * Gets the current timestamp in milliseconds
   */
  private getCurrentTime(): number {
    return Date.now();
  }

  /**
   * Checks if the database connection is open
   *
   * @returns `true` if the database is open, `false` otherwise
   */
  public isOpen(): boolean {
    return this.db.isOpen;
  }

  /**
   * Gets the underlying SQLite database instance
   *
   * @returns The DatabaseSync instance
   */
  public getDatabase(): DatabaseSync {
    return this.db;
  }

  /**
   * Closes the database connection
   */
  public close(): void {
    if (this.db.isOpen) this.db.close();
  }

  /**
   * Disposable implementation - closes the database when disposed
   */
  public [Symbol.dispose]() {
    this.close();
  }

  /**
   * AsyncDisposable implementation - closes the database when disposed
   */
  public async [Symbol.asyncDispose]() {
    this.close();
  }

  /**
   * Retrieves a value by key
   *
   * @param key - The key to retrieve
   * @returns The value associated with the key, or `undefined` if not found or expired
   *
   * @example
   * ```typescript
   * const value = kv.get('my-key');
   * if (value) {
   *   console.log('Found:', value);
   * }
   * ```
   */
  public get(key: string): string | undefined {
    const result = this.statements.get.get(this.getCurrentNamespace(), key);

    if (!result) return undefined;

    // Check if the key has expired
    if (
      result.expires_at &&
      Number(result.expires_at) <= this.getCurrentTime()
    ) {
      this.delete(key);
      return undefined;
    }

    return result.value as string;
  }

  /**
   * Sets a key-value pair
   *
   * @param key - The key to set
   * @param value - The value to associate with the key
   *
   * @example
   * ```typescript
   * kv.set('user:123', JSON.stringify({ name: 'John' }));
   * kv.set('counter', '42');
   * ```
   */
  public set(key: string, value: string): void {
    this.statements.set.run(this.getCurrentNamespace(), key, value, null);
  }

  /**
   * Sets a key-value pair with expiration
   *
   * @param key - The key to set
   * @param value - The value to associate with the key
   * @param ttl - Time to live in milliseconds
   *
   * @example
   * ```typescript
   * // Set with 1 hour expiration
   * kv.setex('session:123', 'user_data', 60 * 60 * 1000);
   *
   * // Set with 5 minutes expiration
   * kv.setex('temp:data', 'cached_value', 5 * 60 * 1000);
   * ```
   */
  public setex(key: string, value: string, ttl: number): void {
    const expiresAt = this.getCurrentTime() + ttl;
    this.statements.setex.run(
      this.getCurrentNamespace(),
      key,
      value,
      expiresAt,
    );
  }

  /**
   * Sets expiration for an existing key
   *
   * @param key - The key to set expiration for
   * @param ttl - Time to live in milliseconds
   * @returns `true` if the key exists and expiration was set, `false` otherwise
   *
   * @example
   * ```typescript
   * kv.set('user:123', 'user_data');
   *
   * // Set 30 minute expiration
   * if (kv.expire('user:123', 30 * 60 * 1000)) {
   *   console.log('Expiration set successfully');
   * }
   * ```
   */
  public expire(key: string, ttl: number): boolean {
    if (!this.has(key)) return false;

    const expiresAt = this.getCurrentTime() + ttl;
    this.statements.expire.run(this.getCurrentNamespace(), expiresAt, key);
    return true;
  }

  /**
   * Gets the time to live for a key
   *
   * @param key - The key to check
   * @returns Time to live in milliseconds, or `-1` if the key doesn't exist, or `-2` if the key has no expiration
   *
   * @example
   * ```typescript
   * const ttl = kv.ttl('user:123');
   * if (ttl > 0) {
   *   console.log(`Key expires in ${ttl}ms`);
   * } else if (ttl === -2) {
   *   console.log('Key has no expiration');
   * } else {
   *   console.log('Key does not exist');
   * }
   * ```
   */
  public ttl(key: string): number {
    const result = this.statements.ttl.get(this.getCurrentNamespace(), key);

    if (!result) return -1; // Key doesn't exist

    if (!result.expires_at) return -2; // No expiration

    const remaining = Number(result.expires_at) - this.getCurrentTime();
    return remaining > 0 ? remaining : -1; // Expired or doesn't exist
  }

  /**
   * Deletes a key-value pair
   *
   * @param key - The key to delete
   *
   * @example
   * ```typescript
   * kv.delete('user:123');
   * ```
   */
  public delete(key: string): void {
    this.statements.delete.run(this.getCurrentNamespace(), key);
  }

  /**
   * Checks if a key exists and is not expired
   *
   * @param key - The key to check
   * @returns `true` if the key exists and is not expired, `false` otherwise
   *
   * @example
   * ```typescript
   * if (kv.has('user:123')) {
   *   console.log('User exists and is not expired');
   * }
   * ```
   */
  public has(key: string): boolean {
    const result = this.statements.has.get(
      this.getCurrentNamespace(),
      key,
      this.getCurrentTime(),
    );

    return (
      result?.count !== undefined &&
      result.count !== null &&
      Number(result.count) > 0
    );
  }

  /**
   * Gets all keys in the current namespace (excluding expired keys)
   *
   * @returns Array of all non-expired keys
   *
   * @example
   * ```typescript
   * const keys = kv.keys();
   * console.log('All keys:', keys);
   * ```
   */
  public keys(): string[] {
    const result = this.statements.keys.all(
      this.getCurrentNamespace(),
      this.getCurrentTime(),
    );

    return result.map((row) => row.key as string);
  }

  /**
   * Gets all values in the current namespace (excluding expired keys)
   *
   * @returns Array of all non-expired values
   *
   * @example
   * ```typescript
   * const values = kv.values();
   * console.log('All values:', values);
   * ```
   */
  public values(): string[] {
    const result = this.statements.values.all(
      this.getCurrentNamespace(),
      this.getCurrentTime(),
    );

    return result.map((row) => row.value as string);
  }

  /**
   * Gets the total number of key-value pairs in the current namespace (excluding expired keys)
   *
   * @returns The count of non-expired key-value pairs
   *
   * @example
   * ```typescript
   * const count = kv.count();
   * console.log(`Total entries: ${count}`);
   * ```
   */
  public count(): number {
    const result = this.statements.count.get(
      this.getCurrentNamespace(),
      this.getCurrentTime(),
    );

    return Number(result?.count ?? 0);
  }

  /**
   * Removes all key-value pairs from the current namespace
   *
   * @example
   * ```typescript
   * kv.clear(); // Removes all entries in current namespace
   * ```
   */
  public clear(): void {
    this.statements.clear.run(this.getCurrentNamespace());
  }

  /**
   * Gets all key-value pairs as an object (excluding expired keys)
   *
   * @returns Object with all non-expired key-value pairs
   *
   * @example
   * ```typescript
   * const all = kv.all();
   * console.log('All entries:', all);
   * // Output: { 'key1': 'value1', 'key2': 'value2' }
   * ```
   */
  public all(): Record<string, string> {
    const result = this.statements.all.all(
      this.getCurrentNamespace(),
      this.getCurrentTime(),
    );

    return Object.fromEntries(
      result.map((row) => [row.key as string, row.value as string]),
    );
  }

  /**
   * Gets all available namespaces (tables) in the database
   *
   * @returns Array of namespace names
   *
   * @example
   * ```typescript
   * const namespaces = kv.namespaces();
   * console.log('Available namespaces:', namespaces);
   * ```
   */
  public namespaces(): string[] {
    const result = this.statements.namespaces.all();

    return result.map((row) => row.name as string);
  }

  /**
   * Gets the current namespace name
   *
   * @returns The current namespace string
   */
  public getCurrentNamespace(): string {
    return this.options.namespace ?? 'commandkit_kv';
  }

  /**
   * Creates a new KV instance with a different namespace
   *
   * @param namespace - The namespace to use for the new instance
   * @returns A new KV instance with the specified namespace
   *
   * @example
   * ```typescript
   * const userKv = kv.namespace('users');
   * const configKv = kv.namespace('config');
   *
   * userKv.set('123', 'John Doe');
   * configKv.set('theme', 'dark');
   * ```
   */
  public namespace(namespace: string): KV {
    return new KV(this.db, {
      enableWAL: this.options.enableWAL,
      namespace,
    });
  }

  /**
   * Iterator implementation for iterating over all non-expired key-value pairs
   *
   * @returns Iterator yielding [key, value] tuples
   *
   * @example
   * ```typescript
   * for (const [key, value] of kv) {
   *   console.log(`${key}: ${value}`);
   * }
   *
   * // Or using spread operator
   * const entries = [...kv];
   * ```
   */
  public *[Symbol.iterator](): Iterator<[string, string]> {
    const result = this.statements.all.iterate(
      this.getCurrentNamespace(),
      this.getCurrentTime(),
    );

    for (const row of result) {
      yield [row.key as string, row.value as string];
    }
  }

  /**
   * Executes a function within a transaction
   *
   * @param fn - Function to execute within the transaction (can be async)
   * @returns The result of the function
   *
   * @example
   * ```typescript
   * // Synchronous transaction
   * kv.transaction(() => {
   *   kv.set('user:123', JSON.stringify({ name: 'John' }));
   *   kv.set('user:456', JSON.stringify({ name: 'Jane' }));
   *   // If any operation fails, all changes are rolled back
   * });
   *
   * // Async transaction
   * await kv.transaction(async () => {
   *   kv.set('user:123', JSON.stringify({ name: 'John' }));
   *   await someAsyncOperation();
   *   kv.set('user:456', JSON.stringify({ name: 'Jane' }));
   *   // If any operation fails, all changes are rolled back
   * });
   * ```
   */
  public async transaction<T>(fn: () => T | Promise<T>): Promise<T> {
    try {
      // Begin transaction
      this.statements.begin.run();

      // Execute the function
      const result = await fn();

      // Commit transaction
      this.statements.commit.run();

      return result;
    } catch (error) {
      // Rollback transaction on error
      this.statements.rollback.run();
      throw error;
    }
  }
}

/**
 * Opens a new KV instance
 *
 * @param path - Database file path, buffer, URL, or existing DatabaseSync instance
 * @param options - Configuration options for the KV store
 * @returns A new KV instance
 */
export function openKV(
  path: string | Buffer | URL | DatabaseSync = 'commandkit_kv.db',
  options: KvOptions = { enableWAL: true, namespace: 'commandkit_kv' },
): KV {
  return new KV(path, options);
}
