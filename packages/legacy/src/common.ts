import { readdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

/**
 * @private
 */
export const FILE_EXTENSIONS = /\.(c|m)?(j|t)sx?$/;

/**
 * @private
 */
export interface FileData {
  name: string;
  path: string;
}

/**
 * @private
 */
export async function recursivelyFindFiles(
  dir: string,
  accumulator: FileData[] = [],
  maxDepth = 5,
) {
  if (maxDepth === 0) return accumulator;

  const files = await readdir(dir, {
    withFileTypes: true,
  });

  for (const file of files) {
    if (file.isDirectory()) {
      await recursivelyFindFiles(
        join(file.parentPath, file.name),
        accumulator,
        maxDepth - 1,
      );
    } else if (file.isFile()) {
      if (file.name.includes('_')) continue;
      if (FILE_EXTENSIONS.test(file.name)) {
        accumulator.push({
          path: join(file.parentPath, file.name),
          name: basename(file.name, extname(file.name)),
        });
      }
    }
  }

  return accumulator;
}
