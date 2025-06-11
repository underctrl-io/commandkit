import { randomUUID } from 'node:crypto';

/**
 * @private
 * @internal
 */
export const DO_NOT_TRACK_KEY = `COMMANDKIT_ANALYTICS__DO_NOT_TRACK::${randomUUID()}`;

/**
 * The analytics events that are used in CommandKit.
 * These events are used to track various actions and metrics within the CommandKit framework.
 */
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

/**
 * The type of analytics events that can be tracked in CommandKit.
 * This type is derived from the keys of the `AnalyticsEvents` object.
 * It ensures that only valid analytics events can be used in the tracking functions.
 */
export type AnalyticsEvent =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
