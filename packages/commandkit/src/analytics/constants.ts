import { randomUUID } from 'node:crypto';

export const DO_NOT_TRACK_KEY = `COMMANDKIT_ANALYTICS__DO_NOT_TRACK::${randomUUID()}`;

export const AnalyticsEvents = {
  COMMAND_EXECUTION: 'command_execution',
  // @commandkit/cache
  CACHE_HIT: 'cache_hit',
  CACHE_MISS: 'cache_miss',
  CACHE_REVALIDATED: 'cache_revalidated',
} as const;

export type AnalyticsEvent =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
