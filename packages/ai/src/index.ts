import './augmentation';
import { AiPlugin } from './plugin';
import { AiPluginOptions } from './types';
import { getAiWorkerContext } from './ai-context-worker';
import { getCommandKit } from 'commandkit';
import type { Message } from 'discord.js';

/**
 * Retrieves the AI context.
 */
export function useAIContext() {
  const { ctx } = getAiWorkerContext();
  return ctx;
}

/**
 * Fetches the AI plugin instance.
 */
export function useAI() {
  const commandkit = getCommandKit(true);
  const aiPlugin = commandkit.plugins.get(AiPlugin);

  if (!aiPlugin) {
    throw new Error(
      'AI plugin is not registered. Please ensure it is activated.',
    );
  }

  return aiPlugin;
}

/**
 * Executes an AI command.
 * @param message The message to execute the AI command on
 * @example
 * ```ts
 * const message = await getMessageSomehow();
 * // use AI to process the message
 * await executeAI(message);
 * ```
 */
export function executeAI(message: Message): Promise<void> {
  const aiPlugin = useAI();
  return aiPlugin.executeAI(message);
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
export * from './configure';
export * from './types';
export * from './system-prompt';
export * from './tools/common/index';
