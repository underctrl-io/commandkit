import { PostHog } from 'posthog-node';
import {
  AnalyticsEngine,
  AnalyticsEvent,
  AnalyticsProvider,
  IdentifyEvent,
} from 'commandkit/analytics';

export class PostHogProvider implements AnalyticsProvider {
  public readonly name = 'PostHog';
  public constructor(public readonly posthog: PostHog) {}

  public async identify(
    engine: AnalyticsEngine,
    event: IdentifyEvent,
  ): Promise<void> {
    const client = engine.commandkit.client;

    this.posthog.identify({
      ...event,
      distinctId: event.id ?? client.user?.id ?? 'commandkit',
    });
  }

  public async track(
    engine: AnalyticsEngine,
    event: AnalyticsEvent,
  ): Promise<void> {
    const client = engine.commandkit.client;

    this.posthog.capture({
      distinctId:
        'id' in event && typeof event.id === 'string'
          ? event.id
          : (client.user?.id ?? 'commandkit'),
      event: event.name,
      properties: event.data,
    });
  }
}
