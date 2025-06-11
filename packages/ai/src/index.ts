import { AiPlugin } from './plugin';
import { AiPluginOptions } from './types';
import { getAiWorkerContext } from './ai-context-worker';

/**
 * Retrieves the AI context.
 */
export function useAIContext() {
  const { ctx } = getAiWorkerContext();
  return ctx;
}

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
