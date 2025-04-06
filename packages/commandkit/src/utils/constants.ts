export const COMMANDKIT_CACHE_TAG = Symbol('kCommandKitCacheTag');

export const COMMANDKIT_IS_DEV = process.env.COMMANDKIT_IS_DEV === 'true';

export const COMMANDKIT_IS_TEST = process.env.COMMANDKIT_IS_TEST === 'true';

export const COMMANDKIT_BOOTSTRAP_MODE = (process.env
  .COMMANDKIT_BOOTSTRAP_MODE || 'development') as 'development' | 'production';

/**
 * Types of Hot Module Replacement events
 */
export const HMREventType = {
  ReloadCommands: 'reload-commands',
  ReloadEvents: 'reload-events',
  Unknown: 'unknown',
} as const;

export type HMREventType = (typeof HMREventType)[keyof typeof HMREventType];
