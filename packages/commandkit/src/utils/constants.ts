export const COMMANDKIT_CACHE_TAG = Symbol('kCommandKitCacheTag');

export const COMMANDKIT_IS_DEV = !!process.env.COMMANDKIT_DEV;

export const COMMANDKIT_IS_TEST = process.env.COMMANDKIT_TEST === 'true';
