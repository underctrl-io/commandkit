export const COMMANDKIT_CACHE_TAG = Symbol('kCommandKitCacheTag');

export const COMMANDKIT_IS_DEV = !!process.env.COMMANDKIT_IS_DEV;

export const COMMANDKIT_IS_TEST = process.env.COMMANDKIT_IS_TEST === 'true';

/**
 * Types of Hot Module Replacement events
 */
export const HMREventType = {
  ReloadCommands: 'reload-commands',
  ReloadEvents: 'reload-events',
  Unknown: 'unknown',
} as const;

export type HMREventType = (typeof HMREventType)[keyof typeof HMREventType];
