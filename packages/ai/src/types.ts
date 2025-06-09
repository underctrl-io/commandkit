import { LanguageModelV1, ProviderMetadata } from 'ai';
import { Message } from 'discord.js';
import { AiContext } from './context';

export type CommandFilterFunction = (commandName: string) => boolean;

export type MessageFilter = (message: Message) => Promise<boolean>;

export type SelectAiModel = (message: Message) => Promise<{
  model: LanguageModelV1;
  options?: ProviderMetadata;
}>;

export interface AiPluginOptions {}

export type AiCommand<T extends Record<string, unknown>> = (
  ctx: AiContext<T>,
) => Promise<unknown> | unknown;
