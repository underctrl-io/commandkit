import { Message } from 'discord.js';
import { MessageFilter, SelectAiModel } from './types';
import { createSystemPrompt } from './system-prompt';

/**
 * Represents the configuration options for the AI model.
 */
export interface ConfigureAI {
  /**
   * A filter function that determines whether a message should be processed by the AI.
   * CommandKit invokes this function before processing the message.
   */
  messageFilter?: MessageFilter;
  /**
   * A function that selects the AI model to use based on the message.
   * This function should return a promise that resolves to an object containing the model and options.
   */
  selectAiModel?: SelectAiModel;
  /**
   * A function that generates a system prompt based on the message.
   * This function should return a promise that resolves to a string containing the system prompt.
   * If not provided, a default system prompt will be used.
   */
  systemPrompt?: (message: Message) => Promise<string>;
  /**
   * A function that prepares the prompt for the AI model.
   */
  preparePrompt?: (message: Message) => Promise<string>;
}

const AIConfig: Required<ConfigureAI> = {
  messageFilter: async (message) =>
    message.mentions.users.has(message.client.user.id),
  systemPrompt: async (message) => createSystemPrompt(message),
  async preparePrompt(message) {
    const userInfo = `<user>
    <id>${message.author.id}</id>
    <name>${message.author.username}</name>
    <displayName>${message.author.displayName}</displayName>
    <avatar>${message.author.avatarURL()}</avatar>
    </user>`;

    return `${userInfo}\nUser: ${message.content}\nAI:`;
  },
  selectAiModel: async () => {
    throw new Error(
      'No AI model selected. Please configure the AI plugin using configureAI() function, making sure to include a selectAiModel function.',
    );
  },
};

/**
 * Configures the AI plugin with the provided options.
 * This function allows you to set a message filter, select an AI model, and generate a system prompt.
 * @param config The configuration options for the AI plugin.
 */
export function configureAI(config: ConfigureAI): void {
  if (config.messageFilter) {
    AIConfig.messageFilter = config.messageFilter;
  }

  if (config.selectAiModel) {
    AIConfig.selectAiModel = config.selectAiModel;
  }

  if (config.systemPrompt) {
    AIConfig.systemPrompt = config.systemPrompt;
  }
}
