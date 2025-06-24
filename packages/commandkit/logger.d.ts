export * from './dist/logger/DefaultLogger';
export * from './dist/logger/Logger';
export * from './dist/logger/ILogger';
export * from './dist/logger/NoopLogger';

import type { ILogger } from './dist/logger/ILogger';

/**
 * Use a custom logger provider.
 */
export function useLogger(logger: ILogger): void;
