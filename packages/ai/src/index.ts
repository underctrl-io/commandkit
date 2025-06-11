import { AiPlugin } from './plugin';
import { AiPluginOptions } from './types';

/**
 * Defines the AI plugin for the application.
 * @param options The options for the AI plugin
 * @returns The AI plugin instance
 */
export function ai(options?: AiPluginOptions) {
  return new AiPlugin(options ?? {});
}

export * from './types';
export * from './plugin';
export * from './context';
