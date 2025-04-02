import { readdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import {
  type Localization,
  type TranslatableCommandName,
  useEnvironment,
} from 'commandkit';
import type { Locale } from 'discord.js';

/**
 * Allows localization api to be used in legacy commands. This function must be called inside a command.
 * @param locale The locale to use. If not provided, the default locale will be used.
 * @example import { locale } from '@commandkit/legacy';
 *
 * export async function run() {
 *   // access localization api for this command
 *   const { t } = locale();
 *   const value = await t('key', { name: 'value' });
 * }
 */
export function locale<
  T extends TranslatableCommandName | (string & {}) = string,
>(
  locale?: Locale,
): Localization<T extends TranslatableCommandName ? T : string> {
  const env = useEnvironment();
  const ctx = env.context;

  if (!ctx) {
    throw new Error('Command execution context not found');
  }

  return ctx.locale<T>(locale);
}

export const FILE_EXTENSIONS = /\.(c|m)?(j|t)sx?$/;

export interface FileData {
  name: string;
  path: string;
}

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
