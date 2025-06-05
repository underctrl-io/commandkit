import { PostHogPlugin, PostHogPluginOptions } from './plugin';

export function posthog(options: PostHogPluginOptions) {
  return new PostHogPlugin(options);
}

export * from './plugin';
export * from './provider';
