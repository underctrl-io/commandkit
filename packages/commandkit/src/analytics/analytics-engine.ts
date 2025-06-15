import { CommandKit } from '../CommandKit';
import { Logger } from '../logger/Logger';
import { warnUnstable } from '../utils/warn-unstable';
import {
  AnalyticsEvent,
  AnalyticsProvider,
  IdentifyEvent,
} from './analytics-provider';
import { getDoNotTrack } from './utils';

/**
 * Filter function type for analytics events.
 * @param engine The analytics engine instance.
 * @param event The analytics event to filter.
 * @returns A boolean indicating whether the event should be tracked.
 */
export type FilterFunction = (
  engine: AnalyticsEngine,
  event: AnalyticsEvent,
) => boolean;

/**
 * AnalyticsEngine class for managing analytics providers and tracking events.
 * This class allows you to register a provider, set a filter for events, and track or identify events.
 */
export class AnalyticsEngine {
  #provider: AnalyticsProvider | null = null;
  #filter: FilterFunction | null = null;

  /**
   * Creates an instance of the AnalyticsEngine.
   * @param commandkit The CommandKit instance.
   */
  public constructor(public readonly commandkit: CommandKit) {}

  /**
   * Sets a filter function for analytics events.
   * This function will be called before tracking an event to determine if it should be tracked.
   * If the filter returns `false`, the event will not be tracked.
   * If the filter is set to `null`, all events will be tracked unless `doNotTrack` is enabled.
   * @param filter The filter function to set, or `null` to remove the filter.
   */
  public setFilter(filter: FilterFunction | null) {
    this.#filter = filter;
  }

  /**
   * Registers an analytics provider.
   * This provider will be used to track and identify events.
   * If a provider is already registered, it will be replaced with the new one.
   * @param provider The analytics provider to register.
   */
  public registerProvider(provider: AnalyticsProvider) {
    this.#provider = provider;
  }

  /**
   * Removes the currently registered analytics provider.
   * @param provider The analytics provider to remove.
   */
  public removeProvider(provider: AnalyticsProvider) {
    if (this.#provider === provider) {
      this.#provider = null;
    }
  }

  /**
   * Retrieves the currently registered analytics provider.
   * @returns The currently registered analytics provider, or `null` if no provider is registered.
   */
  public getProvider(): AnalyticsProvider | null {
    return this.#provider;
  }

  /**
   * Identifies a user with the analytics provider.
   * This method sends an identify event to the provider, which can be used to associate user data with events.
   * @param event The identify event containing user data to send to the provider.
   */
  public async identify(event: IdentifyEvent) {
    if (!this.#provider) return;

    try {
      await this.#provider!.identify?.(this, event);
    } catch (error) {
      Logger.error(
        `Error identifying with provider ${this.#provider!.name}`,
        error,
      );
    }
  }

  /**
   * Tracks an analytics event with the registered provider.
   * This method sends the event to the provider, which can then process it as needed.
   * If the `doNotTrack` setting is enabled or if the filter function returns `false`, the event will not be tracked.
   * @param event The analytics event to track.
   */
  public async track(event: AnalyticsEvent) {
    if (!this.#provider) return;
    try {
      if (await this.#doNotTrack(event)) return;
      await this.#provider!.track(this, event);
    } catch (error) {
      Logger.error(
        `Error tracking ${event.name} event with provider ${this.#provider!.name}`,
        error,
      );
    }
  }

  async #doNotTrack(event: AnalyticsEvent): Promise<boolean> {
    const dnt = getDoNotTrack();

    if (dnt) return true;

    if (this.#filter) {
      return !this.#filter(this, event);
    }

    return false;
  }
}
