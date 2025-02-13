// @ts-check

import { rimrafSync } from 'rimraf';
import { join } from 'node:path';
import fs from 'node:fs';

const resetColor = '\x1b[0m';

export const Colors = {
  reset: (text: string) => `${text}${resetColor}`,
  bright: (text: string) => `\x1b[1m${text}${resetColor}`,
  dim: (text: string) => `\x1b[2m${text}${resetColor}`,
  underscore: (text: string) => `\x1b[4m${text}${resetColor}`,
  blink: (text: string) => `\x1b[5m${text}${resetColor}`,
  reverse: (text: string) => `\x1b[7m${text}${resetColor}`,
  hidden: (text: string) => `\x1b[8m${text}${resetColor}`,

  black: (text: string) => `\x1b[30m${text}${resetColor}`,
  red: (text: string) => `\x1b[31m${text}${resetColor}`,
  green: (text: string) => `\x1b[32m${text}${resetColor}`,
  yellow: (text: string) => `\x1b[33m${text}${resetColor}`,
  blue: (text: string) => `\x1b[34m${text}${resetColor}`,
  magenta: (text: string) => `\x1b[35m${text}${resetColor}`,
  cyan: (text: string) => `\x1b[36m${text}${resetColor}`,
  white: (text: string) => `\x1b[37m${text}${resetColor}`,

  bgBlack: (text: string) => `\x1b[40m${text}${resetColor}`,
  bgRed: (text: string) => `\x1b[41m${text}${resetColor}`,
  bgGreen: (text: string) => `\x1b[42m${text}${resetColor}`,
  bgYellow: (text: string) => `\x1b[43m${text}${resetColor}`,
  bgBlue: (text: string) => `\x1b[44m${text}${resetColor}`,
  bgMagenta: (text: string) => `\x1b[45m${text}${resetColor}`,
  bgCyan: (text: string) => `\x1b[46m${text}${resetColor}`,
  bgWhite: (text: string) => `\x1b[47m${text}${resetColor}`,
};

export function write(message: any) {
  process.stdout.write(message);
  process.stdout.write('\n');
}

/**
 * @returns {never}
 */
export function panic(message: any) {
  write(Colors.red(`Error: ${message}`));
  process.exit(1);
}

export function findPackageJSON() {
  const cwd = process.cwd();
  const target = join(cwd, 'package.json');

  if (!fs.existsSync(target)) {
    panic('Could not find package.json in current directory.');
  }

  return JSON.parse(fs.readFileSync(target, 'utf8'));
}

const possibleFileNames = [
  'commandkit.json',
  'commandkit.config.json',
  'commandkit.js',
  'commandkit.config.js',
  'commandkit.mjs',
  'commandkit.config.mjs',
  'commandkit.cjs',
  'commandkit.config.cjs',
  'commandkit.ts',
  'commandkit.mts',
  'commandkit.cts',
];

export async function findCommandKitConfig(src: string) {
  const cwd = process.cwd();
  const locations = src
    ? [join(cwd, src)]
    : possibleFileNames.map((name) => join(cwd, name));

  for (const location of locations) {
    try {
      return await loadConfigInner(location);
    } catch (e) {
      continue;
    }
  }

  panic(`Could not locate commandkit config from ${cwd}`);
}

function ensureTypeScript(target: string) {
  const isTypeScript = /\.(c|m)tsx?$/.test(target);

  if (isTypeScript && !process.features.typescript) {
    panic(
      'You are trying to load commandkit config file that is written in typescript. The current Node.js version does not have TypeScript feature enabled.',
    );
  }
}

async function loadConfigInner(target: string) {
  const isJSON = target.endsWith('.json');

  await ensureExists(target);

  ensureTypeScript(target);

  /**
   * @type {import('..').CommandKitConfig}
   */
  // @ts-ignore
  const config = await import(`file://${target}`, {
    with: isJSON ? { type: 'json' } : undefined,
  }).then((conf) => conf.default || conf);

  return config;
}

async function ensureExists(loc: string) {
  await fs.promises.access(loc, fs.constants.F_OK);
}

export function erase(dir: string) {
  rimrafSync(dir);
}

export async function copyLocaleFiles(_from: string, _to: string) {
  const resolvedFrom = join(process.cwd(), _from);
  const resolvedTo = join(process.cwd(), _to);

  const localePaths = ['app/locales', 'src/app/locales'];
  const srcLocalePaths = localePaths.map((path) => join(resolvedFrom, path));
  const destLocalePaths = localePaths.map((path) => join(resolvedTo, path));

  for (const localePath of srcLocalePaths) {
    if (!fs.existsSync(localePath)) {
      continue;
    }

    // copy localePath to destLocalePath
    const destLocalePath = destLocalePaths[srcLocalePaths.indexOf(localePath)];

    if (!fs.existsSync(destLocalePath)) {
      fs.promises.mkdir(destLocalePath, { recursive: true });
    }

    await fs.promises.cp(localePath, destLocalePath, {
      recursive: true,
      force: true,
    });
  }
}
