import fs from 'fs-extra';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PackageManager } from './types';

export const textColors = {
  commandkit: ['#fdba74', '#e4a5a2', '#c288de', '#b27bf9'],
  js: ['#f7e01c', '#f7e01c'],
  ts: ['#2480c5', '#2480c5'],
};

export const commands = {
  init: {
    yarn: 'yarn set version stable; yarn config set nodeLinker node-modules;',
  },
};

export function detectPackageManager(): PackageManager {
  const packageManager = process.env.npm_config_user_agent;

  if (packageManager?.includes('pnpm')) return 'pnpm';
  if (packageManager?.includes('yarn')) return 'yarn';
  if (packageManager?.includes('bun')) return 'bun';
  if (packageManager?.includes('npm')) return 'npm';
  if (packageManager?.includes('deno')) return 'deno';

  return 'npm';
}

export function getCommandKitVersion(): string {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
    const packageJson = fs.readJsonSync(packageJsonPath);
    const currentVersion = packageJson.version as string;

    if (currentVersion.includes('dev.')) {
      return '@dev';
    } else if (currentVersion.includes('rc.')) {
      return '@next';
    } else {
      return '@latest';
    }
  } catch (error) {
    console.warn(
      'Could not determine create-commandkit version, defaulting to commandkit@latest',
    );
    return '@latest';
  }
}
