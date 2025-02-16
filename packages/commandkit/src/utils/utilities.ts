import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { COMMANDKIT_IS_DEV } from './constants';

let appDir: string | null = null;

/**
 * Returns the path to the app directory.
 * @returns The path to the app directory or `null` if not found.
 */
export function findAppDirectory(): string | null {
  if (appDir) return appDir;

  let root = join(process.cwd(), COMMANDKIT_IS_DEV ? '.commandkit' : 'dist');

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
