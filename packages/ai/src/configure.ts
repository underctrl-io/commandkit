import { Message, TextChannel } from 'discord.js';
import { AIGenerateResult, MessageFilter, SelectAiModel } from './types';
import { createSystemPrompt } from './system-prompt';
import { createTypingIndicator } from './utils';
import { AiContext } from './context';
import { Logger } from 'commandkit';
import type { generateText } from 'ai';

export type AiMessage = Parameters<typeof generateText>[0]['messages'] & {};

const CKIT_INTERNAL_STOP_TYPING = '<<{{[[((ckitInternalStopTyping))]]}}>>';

/**
 * Represents the configuration options for the AI model.
 */
export interface ConfigureAI {
  /**
   * Whether to disable the built-in tools. Default is false.
   */
  disableBuiltInTools?: boolean;
  /**
   * A filter function that determines whether a message should be processed by the AI.
   * CommandKit invokes this function before processing the message.
   */
  messageFilter?: MessageFilter;
  /**
   * A function that selects the AI model to use based on the message.
   * This function should return a promise that resolves to an object containing the model and options.
   */
  selectAiModel: SelectAiModel;
  /**
   * A function that generates a system prompt based on the message.
   * This function should return a promise that resolves to a string containing the system prompt.
   * If not provided, a default system prompt will be used.
   */
  prepareSystemPrompt?: (ctx: AiContext, message: Message) => Promise<string>;
  /**
   * A function that prepares the prompt for the AI model.
   */
  preparePrompt?: (
    ctx: AiContext,
    message: Message,
  ) => Promise<string | AiMessage>;
  /**
   * A function that gets called when the AI starts processing a message.
   */
  onProcessingStart?: (ctx: AiContext, message: Message) => Promise<void>;
  /**
   * A function that gets called when the AI finishes processing a message.
   */
  onProcessingFinish?: (ctx: AiContext, message: Message) => Promise<void>;
  /**
   * A function that gets called upon receiving the result from the AI model.
   */
  onResult?: (
    ctx: AiContext,
    message: Message,
    result: AIGenerateResult,
  ) => Promise<void>;
  /**
   * A function that gets called when error occurs.
   */
  onError?: (ctx: AiContext, message: Message, error: Error) => Promise<void>;
}

const AIConfig: Required<ConfigureAI> = {
  disableBuiltInTools: false,
  messageFilter: async (commandkit, message) => {
    const prefixOrPrefixes =
      await commandkit.appConfig.getMessageCommandPrefix(message);

    const prefixes = Array.isArray(prefixOrPrefixes)
      ? prefixOrPrefixes
      : [prefixOrPrefixes];

    const possiblyCommand = prefixes.some((p) => message.content.startsWith(p));

    // TODO: figure out a workaround for mention prefixes
    return (
      !possiblyCommand && message.mentions.users.has(message.client.user.id)
    );
  },
  prepareSystemPrompt: async (_ctx, message) => createSystemPrompt(message),
  preparePrompt: async (_ctx, message) => {
    const recentMessages = await message.channel.messages.fetch({
      limit: 10,
      before: message.id,
    });

    const isMe = (id: string) => id === message.client.user.id;

    const conversation: AiMessage = recentMessages
      .filter((msg) => msg.content && (!msg.author.bot || isMe(msg.author.id)))
      .reverse()
      .map((msg) => ({
        role: isMe(msg.author.id) ? 'assistant' : 'user',
        annotations: {
          authorId: msg.author.id,
          authorName: msg.author.username,
          authorAvatar: msg.author.displayAvatarURL(),
        },
        createdAt: msg.createdAt,
        content: msg.content,
        experimental_attachments: msg.attachments.map((attachment) => ({
          url: attachment.url,
          name: attachment.name,
          contentType: attachment.contentType || undefined,
        })),
      }));

    return [
      ...conversation,
      {
        role: 'user',
        annotations: {
          authorId: message.author.id,
          authorName: message.author.username,
          authorAvatar: message.author.displayAvatarURL(),
        },
        createdAt: message.createdAt,
        content: message.content,
        experimental_attachments: message.attachments.map((attachment) => ({
          url: attachment.url,
          name: attachment.name,
          contentType: attachment.contentType || undefined,
        })),
      },
    ] as AiMessage;
  },
  selectAiModel: async () => {
    throw new Error(
      'No AI model selected. Please configure the AI plugin using configureAI() function, making sure to include a selectAiModel function.',
    );
  },
  onProcessingStart: async (ctx, message) => {
    const channel = message.channel;
    const stop = await createTypingIndicator(channel);
    ctx.store.set(CKIT_INTERNAL_STOP_TYPING, stop);
  },
  onProcessingFinish: async (ctx) => {
    const stop = ctx.store.get(CKIT_INTERNAL_STOP_TYPING);

    if (stop) {
      stop();
      ctx.store.delete(CKIT_INTERNAL_STOP_TYPING);
    }
  },
  onResult: async (_ctx, message, result) => {
    if (!!result.text) {
      await message.reply({
        content: result.text.substring(0, 2000),
        allowedMentions: { parse: [] },
      });
    }
  },
  onError: async (_ctx, message, error) => {
    Logger.error(`Error processing AI message: ${error}`);
    const channel = message.channel as TextChannel;

    if (channel.isSendable()) {
      await message
        .reply({
          content: 'An error occurred while processing your request.',
          allowedMentions: { parse: [] },
        })
        .catch((e) => Logger.error(`Failed to send error message: ${e}`));
    }
  },
};

/**
 * Retrieves the current AI configuration.
 */
export function getAIConfig(): Required<ConfigureAI> {
  return AIConfig;
}

/**
 * Configures the AI plugin with the provided options.
 * This function allows you to set a message filter, select an AI model, and generate a system prompt.
 * @param config The configuration options for the AI plugin.
 */
export function configureAI(config: ConfigureAI): void {
  Object.assign(AIConfig, config);
}
