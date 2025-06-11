import { LanguageModelV1, ProviderMetadata, Tool, type generateText } from 'ai';
import { Message } from 'discord.js';
import { AiContext } from './context';
import { LoadedCommand } from 'commandkit';

/**
 * Represents the result of an AI text generation operation.
 */
export type AIGenerateResult = Awaited<ReturnType<typeof generateText>>;

/**
 * Function type for filtering commands based on their name.
 * @param commandName - The name of the command to filter.
 * @returns A boolean indicating whether the command should be included in the filter.
 */
export type CommandFilterFunction = (commandName: string) => boolean;

/**
 * Function type for filtering messages before they are processed by the AI.
 * @param message - The message to filter.
 * @returns A promise that resolves to a boolean indicating whether the message should be processed.
 */
export type MessageFilter = (message: Message) => Promise<boolean>;

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
 * Represents a command that can be executed by the AI.
 * @param T - The type of parameters that the command accepts.
 * @param ctx - The AI context in which the command is executed, including the message and parameters.
 */
export type AiCommand<T extends Record<string, unknown>> = (
  ctx: AiContext<T>,
) => Promise<unknown> | unknown;
