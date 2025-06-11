import { Umami } from '@umami/node';
import {
  AnalyticsEngine,
  AnalyticsEvent,
  AnalyticsProvider,
  IdentifyEvent,
} from 'commandkit/analytics';

/**
 * Umami analytics provider for CommandKit.
 * This provider allows you to track events and identify users using Umami.
 */
export class UmamiProvider implements AnalyticsProvider {
  public readonly name = 'Umami';
  public constructor(public readonly umami: Umami) {}

  public async identify(
    engine: AnalyticsEngine,
    event: IdentifyEvent,
  ): Promise<void> {
    void engine;
    await this.umami.identify(event);
  }

  public async track(
    engine: AnalyticsEngine,
    event: AnalyticsEvent,
  ): Promise<void> {
    void engine;
    await this.umami.track(event.name, event.data);
  }
}
