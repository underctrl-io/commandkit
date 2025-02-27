import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COMMANDKIT_IS_DEV } from './constants';
import { getConfig } from '../config/config';

let appDir: string | null = null;

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

  return ((...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, ms);
  }) as F;
}
