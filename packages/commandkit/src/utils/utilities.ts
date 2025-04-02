import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COMMANDKIT_IS_DEV } from './constants';
import { getConfig } from '../config/config';

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
