import { AnalyticsEngine } from './analytics-engine';

export interface AnalyticsEvent {
  name: string;
  id?: string;
  data: Record<string, any>;
}

export type IdentifyEvent = Record<string, any>;

export interface AnalyticsProvider {
  readonly name: string;
  track(engine: AnalyticsEngine, event: AnalyticsEvent): Promise<void>;
  identify?(engine: AnalyticsEngine, event: IdentifyEvent): Promise<void>;
}
