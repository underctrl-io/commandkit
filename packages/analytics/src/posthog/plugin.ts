import { CommandKitPluginRuntime, RuntimePlugin } from 'commandkit/plugin';
import { PostHog, PostHogOptions } from 'posthog-node';
import { PostHogProvider } from './provider';

export interface PostHogPluginOptions {
  posthogOptions: {
    apiKey: string;
    options?: PostHogOptions;
  };
}

export class PostHogPlugin extends RuntimePlugin<PostHogPluginOptions> {
  public readonly name = 'PostHog';

  private provider: PostHogProvider | null = null;

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    const posthog = new PostHog(
      this.options.posthogOptions.apiKey,
      this.options.posthogOptions.options,
    );

    this.provider = new PostHogProvider(posthog);

    ctx.commandkit.analytics.registerProvider(this.provider);
  }

  public async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    if (!this.provider) return;

    await this.provider.posthog.shutdown();

    ctx.commandkit.analytics.removeProvider(this.provider);
  }
}
