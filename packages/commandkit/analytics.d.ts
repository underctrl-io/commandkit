import type { AnalyticsEngine } from './dist/CommandKit-CykDrHnK';

export * from './dist/analytics/analytics-engine';
export * from './dist/analytics/analytics-provider';
export { noAnalytics } from './dist/analytics/utils';

export function useAnalytics(): AnalyticsEngine;
export function track(event: AnalyticsEvent): Promise<void>;
