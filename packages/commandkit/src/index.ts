export * from './CommandKit';
export * from './components';
export * from './config';
export type * from './types';

function getCommandKitVersion(): string {
  'use macro';
  return require('../package.json').version;
}

/**
 * The current version of CommandKit.
 */
export const version = getCommandKitVersion();
