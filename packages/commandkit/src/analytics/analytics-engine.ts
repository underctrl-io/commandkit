import { CommandKit } from '../CommandKit';
import { Logger } from '../logger/Logger';
import { warnUnstable } from '../utils/warn-unstable';
import {
  AnalyticsEvent,
  AnalyticsProvider,
  IdentifyEvent,
} from './analytics-provider';
import { getDoNotTrack } from './utils';

export type FilterFunction = (
  engine: AnalyticsEngine,
  event: AnalyticsEvent,
) => boolean;

export class AnalyticsEngine {
  #provider: AnalyticsProvider | null = null;
  #filter: FilterFunction | null = null;

  public constructor(public readonly commandkit: CommandKit) {}

  public setFilter(filter: FilterFunction | null) {
    this.#filter = filter;
  }

  public registerProvider(provider: AnalyticsProvider) {
    warnUnstable('analytics');
    this.#provider = provider;
  }

  public removeProvider(provider: AnalyticsProvider) {
    if (this.#provider === provider) {
      this.#provider = null;
    }
  }

  public getProvider(): AnalyticsProvider | null {
    return this.#provider;
  }

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
      return this.#filter(this, event);
    }

    return false;
  }
}
