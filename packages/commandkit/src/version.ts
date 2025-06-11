/**
 * @private
 */
function $version(): string {
  'use macro';
  return require('../package.json').version;
}

/**
 * The current version of CommandKit.
 */
export const version: string = $version();
