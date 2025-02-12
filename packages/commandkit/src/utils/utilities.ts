import { existsSync } from 'node:fs';
import { join } from 'node:path';

let appDir: string | null = null;

/**
 * Returns the path to the app directory.
 * @returns The path to the app directory or `null` if not found.
 */
export function findAppDirectory(): string | null {
  if (appDir) return appDir;

  const root = process.cwd();
  const dirs = ['app', 'src/app'].map((dir) => join(root, dir));

  for (const dir of dirs) {
    if (existsSync(dir)) {
      appDir = dir;
      return dir;
    }
  }

  return null;
}
