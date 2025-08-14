import { CommandKitConfig } from './types';

/**
 * @private
 */
export type DeepRequired<T, OptionalKeys extends keyof T = never> = {
  [P in keyof T]-?: P extends OptionalKeys ? Partial<T[P]> : DeepRequired<T[P]>;
};

/**
 * @private
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

/**
 * @private
 * @example
 * ```ts
 * const target = { a: 1, b: { c: 2 } };
 * const source = { b: { d: 3 } };
 * const result = mergeDeep(target, source);
 * // result = { a: 1, b: { c: 2, d: 3 } }
 * ```
 */
export const mergeDeep = <T extends Record<string, any>>(
  target: T,
  source?: T,
  tracker = new WeakMap<object, boolean>(),
): T => {
  if (!source) return target;
  const isObject = (obj: unknown) =>
    obj && typeof obj === 'object' && !Array.isArray(obj);

  // Prevent infinite recursion
  if (tracker.has(target)) {
    return target;
  }

  // Mark the target as visited
  tracker.set(target, true);

  const output: T = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key as keyof T] = mergeDeep(target[key], source[key], tracker);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output as T;
};

export type ResolvedCommandKitConfig = DeepRequired<
  CommandKitConfig,
  'compilerOptions'
>;
