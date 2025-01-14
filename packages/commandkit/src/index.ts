export * from './CommandKit';
export * from './components';
export * from './config';
export * from './context/async-context';
export * from './context/environment';
export * from './cache/index';
export type * from './types';

function $version(): string {
  'use macro';
  return require('../package.json').version;
}

/**
 * The current version of CommandKit.
 */
export const version = $version();
