import { PostHogPlugin, PostHogPluginOptions } from './plugin';

/**
 * Defines the PostHog plugin for the application.
 * @param options The options for the PostHog plugin
 * @returns The PostHog plugin instance
 */
export function posthog(options: PostHogPluginOptions) {
  return new PostHogPlugin(options);
}

export * from './plugin';
export * from './provider';
