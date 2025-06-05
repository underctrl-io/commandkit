import { randomUUID } from 'node:crypto';

export const DO_NOT_TRACK_KEY = `COMMANDKIT_ANALYTICS__DO_NOT_TRACK::${randomUUID()}`;

export const AnalyticsEvents = {
  // commands
  COMMAND_EXECUTION: 'command_execution',
  // feature flags
  FEATURE_FLAG_METRICS: 'feature_flag_metrics',
  FEATURE_FLAG_DECISION: 'feature_flag_decision',
  // @commandkit/cache
  CACHE_HIT: 'cache_hit',
  CACHE_MISS: 'cache_miss',
  CACHE_REVALIDATED: 'cache_revalidated',
} as const;

export type AnalyticsEvent =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
