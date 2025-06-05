import type { AnalyticsEngine } from './dist/analytics/analytics-engine';

export * from './dist/analytics/analytics-engine';
export * from './dist/analytics/analytics-provider';
export { noAnalytics } from './dist/analytics/utils';
export { AnalyticsEvents } from './dist/analytics/constants';

export function useAnalytics(): AnalyticsEngine;
export function track(event: AnalyticsEvent): Promise<void>;
