import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COMMANDKIT_IS_DEV } from './constants';
import { getConfig } from '../config/config';
import { eventWorkerContext } from '../app/events/EventWorkerContext';

let appDir: string | null = null;
let currentDir: string | null = null;

export function getCurrentDirectory(): string {
  if (currentDir) return currentDir;

  let root = join(
    process.cwd(),
    COMMANDKIT_IS_DEV ? '.commandkit' : getConfig().distDir,
  );

  if (!existsSync(root)) root = process.cwd();

  currentDir = root;

  return root;
}

export function getSourceDirectories(): string[] {
  const dist = getConfig().distDir;
  const locations = ['src', '.commandkit', dist].map((dir) =>
    join(process.cwd(), dir),
  );

  return locations;
}

/**
 * Returns the path to the app directory.
 * @returns The path to the app directory or `null` if not found.
 */
export function findAppDirectory(): string | null {
  if (appDir) return appDir;

  let root = join(
    process.cwd(),
    COMMANDKIT_IS_DEV ? '.commandkit' : getConfig().distDir,
  );

  if (!existsSync(root)) root = process.cwd();

  const dirs = ['app'].map((dir) => join(root, dir));

  for (const dir of dirs) {
    if (existsSync(dir)) {
      appDir = dir;
      return dir;
    }
  }

  return null;
}

/**
 * Debounces a function.
 * @param fn The function to debounce.
 * @param ms The debounce time in milliseconds.
 * @returns The debounced function.
 */
export function debounce<R, F extends (...args: any[]) => R>(
  fn: F,
  ms: number,
): F {
  let timer: NodeJS.Timeout | null = null;
  let resolve: ((value: R | PromiseLike<R>) => void) | null = null;

  return ((...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
      if (resolve) {
        resolve(null as unknown as R); // Resolve with null if debounced
      }
    }

    return new Promise<R>((res) => {
      resolve = res;
      timer = setTimeout(() => {
        const result = fn(...args);
        res(result);
        timer = null;
        resolve = null;
      }, ms);
    });
  }) as F;
}

/**
 * Creates a function from the given function that runs only in development mode.
 * @param fn The function to run in development mode.
 * @returns The function that runs only in development mode.
 * @example
 * ```ts
 * const devOnlyFn = devOnly(() => {
 *   console.log('This function runs only in development mode');
 * });
 * devOnlyFn(); // This will log the message only in development mode
 * ```
 */
export function devOnly<T extends (...args: any[]) => any>(fn: T): T {
  const f = (...args: Parameters<T>) => {
    if (COMMANDKIT_IS_DEV) {
      return fn(...args);
    }
  };

  return f as T;
}

/**
 * Custom error for stopping event propagation.
 */
export class StopEventPropagationError extends Error {
  constructor() {
    super('Event propagation stopped');
    this.name = 'StopEventPropagationError';
  }
}

/**
 * Stops event propagation.
 * @throws {StopEventPropagationError}
 */
export function stopEvents(): never {
  if (!eventWorkerContext.getStore()) {
    throw new Error('stopEvents() may only be called inside an event handler');
  }

  throw new StopEventPropagationError();
}

export interface SimpleProxy<T extends object> {
  proxy: T;
  setTarget(newTarget: T): void;
}

/**
 * Creates a simple proxy object that mirrors the target object.
 * @param target The target object to proxy.
 * @returns The proxied object.
 */
export function createProxy<T extends object>(target: T): SimpleProxy<T> {
  let _target = target;

  const proxy = new Proxy(_target, {
    get(target, prop, receiver) {
      return Reflect.get(_target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      return Reflect.set(_target, prop, value, receiver);
    },
    deleteProperty(target, prop) {
      return Reflect.deleteProperty(_target, prop);
    },
    has(target, prop) {
      return Reflect.has(_target, prop);
    },
    ownKeys(target) {
      return Reflect.ownKeys(_target);
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(_target, prop);
    },
    defineProperty(target, prop, attributes) {
      return Reflect.defineProperty(_target, prop, attributes);
    },
    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(_target);
    },
    setPrototypeOf(target, proto) {
      return Reflect.setPrototypeOf(_target, proto);
    },
    isExtensible(target) {
      return Reflect.isExtensible(_target);
    },
    preventExtensions(target) {
      return Reflect.preventExtensions(_target);
    },
    apply(target, thisArg, args) {
      // @ts-ignore
      return Reflect.apply(_target, thisArg, args);
    },
    construct(target, args, newTarget) {
      // @ts-ignore
      return Reflect.construct(_target, args, newTarget);
    },
  });

  return {
    proxy,
    setTarget(newTarget: T) {
      _target = newTarget;
    },
  };
}
