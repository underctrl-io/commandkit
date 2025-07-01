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
