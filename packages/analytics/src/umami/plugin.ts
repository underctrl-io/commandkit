import { UmamiOptions, Umami } from '@umami/node';
import { CommandKitPluginRuntime, RuntimePlugin } from 'commandkit/plugin';
import { UmamiProvider } from './provider';

/**
 * Options for the Umami plugin.
 */
export interface UmamiPluginOptions {
  /**
   * The Umami API options.
   */
  umamiOptions: UmamiOptions;
}

export class UmamiPlugin extends RuntimePlugin<UmamiPluginOptions> {
  public readonly name = 'Umami';

  private provider: UmamiProvider | null = null;

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    const umami = new Umami(this.options.umamiOptions);

    this.provider = new UmamiProvider(umami);

    ctx.commandkit.analytics.registerProvider(this.provider);
  }

  public async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    if (!this.provider) return;
    ctx.commandkit.analytics.removeProvider(this.provider);
  }
}
