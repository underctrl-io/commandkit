import { DatabaseSync, StatementSync } from 'node:sqlite';
import { deserializer, serializer } from './serde';
import { getNestedValue, setNestedValue } from './dotprops';

export type { SerializedValue } from './serde';

/**
 * Mathematical operators supported by the KV math method
 */
export type KvMathOperator = '+' | '-' | '*' | '/' | '^' | '%';

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
 * with support for namespaces, automatic cleanup, iteration, expiration, and JSON serialization.
 *
 * @example
 * ```typescript
 * const kv = new KV('data.db');
 *
 * // Store any JSON-serializable data
 * kv.set('user:123', { name: 'John', age: 30 });
 * kv.set('counter', 42);
 * kv.set('active', true);
 * kv.set('dates', [new Date(), new Date()]);
 *
 * // Use dot notation for nested properties
 * kv.set('user:123.name', 'John');
 * kv.set('user:123.settings.theme', 'dark');
 *
 * // Retrieve data
 * const user = kv.get('user:123'); // { name: 'John', age: 30, settings: { theme: 'dark' } }
 * const name = kv.get('user:123.name'); // 'John'
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

    const namespace = this.options.namespace ?? 'commandkit_kv';

    this.db.exec(/* sql */ `
      CREATE TABLE IF NOT EXISTS ${namespace} (
        key TEXT PRIMARY KEY,
        value TEXT,
        expires_at INTEGER
      )
    `);

    this.statements = {
      get: this.db.prepare(
        /* sql */ `SELECT value, expires_at FROM ${namespace} WHERE key = ?`,
      ),
      set: this.db.prepare(
        /* sql */ `INSERT OR REPLACE INTO ${namespace} (key, value, expires_at) VALUES (?, ?, ?)`,
      ),
      setex: this.db.prepare(
        /* sql */ `INSERT OR REPLACE INTO ${namespace} (key, value, expires_at) VALUES (?, ?, ?)`,
      ),
      delete: this.db.prepare(
        /* sql */ `DELETE FROM ${namespace} WHERE key = ?`,
      ),
      has: this.db.prepare(
        /* sql */ `SELECT COUNT(*) FROM ${namespace} WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)`,
      ),
      keys: this.db.prepare(
        /* sql */ `SELECT key FROM ${namespace} WHERE expires_at IS NULL OR expires_at > ?`,
      ),
      values: this.db.prepare(
        /* sql */ `SELECT value FROM ${namespace} WHERE expires_at IS NULL OR expires_at > ?`,
      ),
      clear: this.db.prepare(/* sql */ `DELETE FROM ${namespace}`),
      count: this.db.prepare(
        /* sql */ `SELECT COUNT(*) FROM ${namespace} WHERE expires_at IS NULL OR expires_at > ?`,
      ),
      all: this.db.prepare(
        /* sql */ `SELECT key, value FROM ${namespace} WHERE expires_at IS NULL OR expires_at > ?`,
      ),
      expire: this.db.prepare(
        /* sql */ `UPDATE ${namespace} SET expires_at = ? WHERE key = ?`,
      ),
      ttl: this.db.prepare(
        /* sql */ `SELECT expires_at FROM ${namespace} WHERE key = ?`,
      ),
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
   * @param key - The key to retrieve (supports dot notation for nested properties)
   * @returns The value associated with the key, or `undefined` if not found or expired
   *
   * @example
   * ```typescript
   * // Store an object
   * kv.set('user:123', { name: 'John', age: 30, settings: { theme: 'dark' } });
   *
   * // Get the entire object
   * const user = kv.get('user:123');
   * // { name: 'John', age: 30, settings: { theme: 'dark' } }
   *
   * // Get nested properties using dot notation
   * const name = kv.get('user:123.name'); // 'John'
   * const theme = kv.get('user:123.settings.theme'); // 'dark'
   * ```
   */
  public get<T = any>(key: string): T | undefined {
    const result = this.statements.get.get(key);

    if (!result) return undefined;

    // Check if the key has expired
    if (
      result.expires_at &&
      Number(result.expires_at) <= this.getCurrentTime()
    ) {
      this.delete(key);
      return undefined;
    }

    const serialized = JSON.parse(result.value as string);
    const deserialized = deserializer(serialized);

    // Handle dot notation for nested properties
    if (key.includes('.')) {
      return getNestedValue(deserialized, key.split('.').slice(1).join('.'));
    }

    return deserialized;
  }

  /**
   * Sets a key-value pair
   *
   * @param key - The key to set (supports dot notation for nested properties)
   * @param value - The value to associate with the key (any JSON-serializable type)
   *
   * @example
   * ```typescript
   * // Store primitive values
   * kv.set('counter', 42);
   * kv.set('active', true);
   * kv.set('name', 'John');
   *
   * // Store objects
   * kv.set('user:123', { name: 'John', age: 30 });
   *
   * // Store arrays
   * kv.set('tags', ['javascript', 'typescript', 'sqlite']);
   *
   * // Store dates
   * kv.set('created', new Date());
   *
   * // Store maps and sets
   * kv.set('permissions', new Map([['admin', true], ['user', false]]));
   * kv.set('unique_ids', new Set([1, 2, 3, 4, 5]));
   *
   * // Use dot notation for nested properties
   * kv.set('user:123.settings.theme', 'dark');
   * kv.set('user:123.settings.notifications', true);
   * ```
   */
  public set(key: string, value: any): void {
    let serializedValue: string;

    if (key.includes('.')) {
      // Handle dot notation for nested properties
      const [baseKey, ...pathParts] = key.split('.');
      const path = pathParts.join('.');

      // Get existing value or create new object
      const existing = this.get(baseKey) || {};
      setNestedValue(existing, path, value);

      const serialized = serializer(existing);
      serializedValue = JSON.stringify(serialized);

      this.statements.set.run(baseKey, serializedValue, null);
    } else {
      const serialized = serializer(value);
      serializedValue = JSON.stringify(serialized);

      this.statements.set.run(key, serializedValue, null);
    }
  }

  /**
   * Sets a key-value pair with expiration
   *
   * @param key - The key to set (supports dot notation for nested properties)
   * @param value - The value to associate with the key (any JSON-serializable type)
   * @param ttl - Time to live in milliseconds
   *
   * @example
   * ```typescript
   * // Set with 1 hour expiration
   * kv.setex('session:123', { userId: 123, token: 'abc123' }, 60 * 60 * 1000);
   *
   * // Set with 5 minutes expiration
   * kv.setex('temp:data', { cached: true, timestamp: Date.now() }, 5 * 60 * 1000);
   *
   * // Use dot notation with expiration
   * kv.setex('user:123.temp_settings', { theme: 'light' }, 30 * 60 * 1000);
   * ```
   */
  public setex(key: string, value: any, ttl: number): void {
    const expiresAt = this.getCurrentTime() + ttl;
    let serializedValue: string;

    if (key.includes('.')) {
      // Handle dot notation for nested properties
      const [baseKey, ...pathParts] = key.split('.');
      const path = pathParts.join('.');

      // Get existing value or create new object
      const existing = this.get(baseKey) || {};
      setNestedValue(existing, path, value);

      const serialized = serializer(existing);
      serializedValue = JSON.stringify(serialized);

      this.statements.setex.run(baseKey, serializedValue, expiresAt);
    } else {
      const serialized = serializer(value);
      serializedValue = JSON.stringify(serialized);

      this.statements.setex.run(key, serializedValue, expiresAt);
    }
  }

  /**
   * Performs mathematical operations on numeric values in the KV store
   *
   * @param key - The key to perform math operation on (supports dot notation for nested properties)
   * @param operator - The mathematical operator to apply
   * @param value - The value to use in the operation
   * @returns The updated value after the mathematical operation
   * @throws Error if the existing value is not numeric or if the operation is invalid
   *
   * @example
   * ```typescript
   * // Initialize a counter
   * kv.set('counter', 10);
   *
   * // Increment by 5
   * const result1 = kv.math('counter', '+', 5); // 15
   *
   * // Multiply by 2
   * const result2 = kv.math('counter', '*', 2); // 30
   *
   * // Use with bigint
   * kv.set('big_counter', BigInt(1000));
   * const result3 = kv.math('big_counter', '+', BigInt(500)); // 1500n
   *
   * // Use with dot notation
   * kv.set('user:123', { score: 100, level: 5 });
   * const result4 = kv.math('user:123.score', '+', 50); // 150
   * ```
   */
  public math(
    key: string,
    operator: KvMathOperator,
    value: number | bigint,
  ): number | bigint {
    const existingValue = this.get(key);

    if (existingValue === undefined) {
      throw new Error(`Key '${key}' does not exist`);
    }

    if (
      typeof existingValue !== 'number' &&
      typeof existingValue !== 'bigint'
    ) {
      throw new Error(
        `Value at key '${key}' is not numeric. Expected number or bigint, got ${typeof existingValue}`,
      );
    }

    // Handle mixed number/bigint operations by converting to bigint
    const isBigIntOperation =
      typeof existingValue === 'bigint' || typeof value === 'bigint';

    const existing = isBigIntOperation
      ? typeof existingValue === 'bigint'
        ? existingValue
        : BigInt(existingValue)
      : (existingValue as number);
    const operand = isBigIntOperation
      ? typeof value === 'bigint'
        ? value
        : BigInt(value)
      : (value as number);

    let result: number | bigint;

    switch (operator) {
      case '+':
        result = (existing as any) + (operand as any);
        break;
      case '-':
        result = (existing as any) - (operand as any);
        break;
      case '*':
        result = (existing as any) * (operand as any);
        break;
      case '/':
        if (operand === 0 || operand === 0n) {
          throw new Error('Division by zero');
        }
        result = (existing as any) / (operand as any);
        break;
      case '^':
        if (isBigIntOperation && operand < 0n) {
          throw new Error(
            'Exponentiation with negative exponent is not supported for bigint',
          );
        }
        result = (existing as any) ** (operand as any);
        break;
      case '%':
        if (operand === 0 || operand === 0n) {
          throw new Error('Modulo by zero');
        }
        result = (existing as any) % (operand as any);
        break;
      default:
        throw new Error(`Invalid operator: ${operator}`);
    }

    // Update the value in the store
    this.set(key, result);

    return result;
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
   * kv.set('user:123', { name: 'John', age: 30 });
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
    this.statements.expire.run(expiresAt, key);
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
    const result = this.statements.ttl.get(key);

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
   * kv.delete('user:123.settings.theme'); // Delete nested property
   * ```
   */
  public delete(key: string): void {
    this.statements.delete.run(key);
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
   *
   * if (kv.has('user:123.settings.theme')) {
   *   console.log('Theme setting exists');
   * }
   * ```
   */
  public has(key: string): boolean {
    const result = this.statements.has.get(key, this.getCurrentTime());

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
    const result = this.statements.keys.all(this.getCurrentTime());

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
  public values(): any[] {
    const result = this.statements.values.all(this.getCurrentTime());

    return result.map((row) => {
      const serialized = JSON.parse(row.value as string);
      return deserializer(serialized);
    });
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
    const result = this.statements.count.get(this.getCurrentTime());

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
    this.statements.clear.run();
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
   * // Output: { 'key1': value1, 'key2': value2 }
   * ```
   */
  public all(): Record<string, any> {
    const result = this.statements.all.all(this.getCurrentTime());

    return Object.fromEntries(
      result.map((row) => {
        const serialized = JSON.parse(row.value as string);
        return [row.key as string, deserializer(serialized)];
      }),
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
   * userKv.set('123', { name: 'John', age: 30 });
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
   *   console.log(`${key}:`, value);
   * }
   *
   * // Or using spread operator
   * const entries = [...kv];
   * ```
   */
  public *[Symbol.iterator](): Iterator<[string, any]> {
    const result = this.statements.all.iterate(this.getCurrentTime());

    for (const row of result) {
      const serialized = JSON.parse(row.value as string);
      yield [row.key as string, deserializer(serialized)];
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
   *   kv.set('user:123', { name: 'John', age: 30 });
   *   kv.set('user:456', { name: 'Jane', age: 25 });
   *   // If any operation fails, all changes are rolled back
   * });
   *
   * // Async transaction
   * await kv.transaction(async () => {
   *   kv.set('user:123', { name: 'John', age: 30 });
   *   await someAsyncOperation();
   *   kv.set('user:456', { name: 'Jane', age: 25 });
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
