import { Tool, type generateText } from 'ai';
import { Message } from 'discord.js';
import { AiContext } from './context';
import CommandKit, { LoadedCommand, MessageCommandContext } from 'commandkit';
import { AiConfig } from './plugin';
import { InferParameters } from './tools/common';

/**
 * Represents the result of an AI text generation operation.
 */
export type AIGenerateResult = Awaited<ReturnType<typeof generateText>>;

/**
 * Function type for filtering messages before they are processed by the AI.
 * @param message - The message to filter.
 * @returns A promise that resolves to a boolean indicating whether the message should be processed.
 */
export type MessageFilter = (
  commandkit: CommandKit,
  message: Message,
) => Promise<boolean>;

/**
 * Function type for selecting an AI model based on the message.
 * @param message - The message to base the model selection on.
 * @returns A promise that resolves to an object containing the selected model and optional metadata.
 */
export type SelectAiModel = (
  ctx: AiContext,
  message: Message,
) => Promise<SelectAiModelResult>;

export type SelectAiModelResult = Parameters<typeof generateText>[0];

export type CommandTool = LoadedCommand & {
  tool: Tool;
};
/**
 * Options for the AI plugin.
 */
export interface AiPluginOptions {}

/**
 * Extracts the AI configuration params.
 */
export type ExtractAiConfig<T extends Record<string, unknown>> =
  T extends AiConfig ? InferParameters<T['inputSchema']> : T;

/**
 * Represents the context in which an AI command is executed.
 * It extends the MessageCommandContext to include AI-specific properties.
 * @param T - The type of parameters that the command accepts.
 */
export type AiCommandContext<T extends Record<string, unknown>> =
  MessageCommandContext & { ai: AiContext<ExtractAiConfig<T>> };

/**
 * Represents a command that can be executed by the AI.
 * @param T - The type of parameters that the command accepts.
 * @param ctx - The AI command context in which the command is executed, including the message and parameters.
 */
export type AiCommand<
  T extends Record<string, unknown> = Record<string, unknown>,
> = (ctx: AiCommandContext<ExtractAiConfig<T>>) => Promise<unknown> | unknown;
