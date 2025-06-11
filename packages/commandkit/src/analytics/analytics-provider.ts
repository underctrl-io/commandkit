import { AnalyticsEngine } from './analytics-engine';

/**
 * AnalyticsEvent interface represents an event that can be tracked by an analytics provider.
 * It includes the event name, an optional unique identifier, and a data object containing event-specific information.
 */
export interface AnalyticsEvent {
  name: string;
  id?: string;
  data: Record<string, any>;
}

/**
 * IdentifyEvent interface represents an event used to identify a user or entity in the analytics system.
 */
export type IdentifyEvent = Record<string, any>;

/**
 * AnalyticsProvider interface defines the contract for analytics providers.
 */
export interface AnalyticsProvider {
  /**
   * The name of the analytics provider.
   * This is used for logging and identification purposes.
   */
  readonly name: string;
  /**
   * Initializes the analytics provider.
   * This method is called when the provider is registered.
   */
  track(engine: AnalyticsEngine, event: AnalyticsEvent): Promise<void>;
  /**
   * Identifies a user or entity with the analytics provider.
   * This method is called to associate user data with events.
   */
  identify?(engine: AnalyticsEngine, event: IdentifyEvent): Promise<void>;
}
