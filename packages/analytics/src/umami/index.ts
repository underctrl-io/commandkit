import { UmamiPlugin, UmamiPluginOptions } from './plugin';

/**
 * Defines the Umami plugin for the application.
 * @param options The options for the Umami plugin
 * @returns The Umami plugin instance
 */
export function umami(options: UmamiPluginOptions) {
  return new UmamiPlugin(options);
}

export * from './plugin';
export * from './provider';
