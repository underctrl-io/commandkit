export * from './CommandKit';
export * from './components';
export * from './config';
export * from './utils/signal';
export * from './hooks';
export { Environment } from './environment/env';
export { client, disposable, registerClient } from './bootstrap/client';
export type * from './types';

/**
 * The current version of CommandKit.
 */
// Note to developers: This needs to explicitly be `string` so it is not typed as a "const string" that gets injected by esbuild
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const version: string = '[VI]{{inject}}[/VI]';
