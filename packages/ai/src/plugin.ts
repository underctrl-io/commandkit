import { CommandKitPluginRuntime, RuntimePlugin } from 'commandkit/plugin';
import { AiPluginOptions, MessageFilter, SelectAiModel } from './types';
import { LoadedCommand, Logger } from 'commandkit';
import { AiContext } from './context';
import { Collection, Events, Message, TextChannel } from 'discord.js';
import { tool, Tool, generateText, generateObject } from 'ai';
import { z } from 'zod';
import { getAiWorkerContext, runInAiWorkerContext } from './ai-context-worker';
import { getAvailableCommands } from './tools/get-available-commands';
import { getChannelById } from './tools/get-channel-by-id';
import { getCurrentClientInfo } from './tools/get-current-client-info';
import { getGuildById } from './tools/get-guild-by-id';
import { getUserById } from './tools/get-user-by-id';
import { createSystemPrompt } from './system-prompt';

type WithAI<T extends LoadedCommand> = T & {
  data: {
    ai: (ctx: AiContext) => Promise<unknown> | unknown;
    aiConfig: AiConfig;
  } & T['data'];
  tool: Tool;
};

/**
 * Represents the configuration options for the AI plugin scoped to a specific command.
 */
export interface AiConfig {
  /**
   * A description of the AI functionality provided by this command. If not given, the command's description will be used.
   */
  description?: string;
  /**
   * A zod schema defining the parameters that the AI command accepts.
   */
  parameters: any;
}

const defaultTools: Record<string, Tool> = {
  getAvailableCommands,
  getChannelById,
  getCurrentClientInfo,
  getGuildById,
  getUserById,
};

export class AiPlugin extends RuntimePlugin<AiPluginOptions> {
  public readonly name = 'AiPlugin';
  private toolsRecord: Record<string, Tool> = {};
  private defaultTools = defaultTools;
  private onMessageFunc: ((message: Message) => Promise<void>) | null = null;

  public constructor(options: AiPluginOptions) {
    super(options);
  }

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    this.onMessageFunc = (message) => this.handleMessage(ctx, message);
    ctx.commandkit.client.on(Events.MessageCreate, this.onMessageFunc);

    Logger.info(`Plugin ${this.name} activated`);
  }

  public async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    this.toolsRecord = {};
    if (this.onMessageFunc) {
      ctx.commandkit.client.off(Events.MessageCreate, this.onMessageFunc);
      this.onMessageFunc = null;
    }
    Logger.info(`Plugin ${this.name} deactivated`);
  }

  private async handleMessage(
    pluginContext: CommandKitPluginRuntime,
    message: Message,
  ): Promise<void> {
    if (message.author.bot || !Object.keys(this.toolsRecord).length) return;

    const aiModelSelector = selectAiModel;
    if (!message.content?.length || !aiModelSelector) return;

    if (!message.channel.isTextBased() || !message.channel.isSendable()) return;

    const shouldContinue = messageFilter ? await messageFilter(message) : true;
    if (!shouldContinue) return;

    const ctx = new AiContext<any>({
      message,
      params: {},
      commandkit: pluginContext.commandkit,
    });

    const systemPrompt =
      (await generateSystemPrompt?.(message)) || createSystemPrompt(message);

    const userInfo = `<user>
    <id>${message.author.id}</id>
    <name>${message.author.username}</name>
    <displayName>${message.author.displayName}</displayName>
    <avatar>${message.author.avatarURL()}</avatar>
    </user>`;

    await runInAiWorkerContext(ctx, message, async () => {
      const channel = message.channel as TextChannel;
      const stopTyping = await this.startTyping(channel);

      try {
        const { model, options } = await aiModelSelector(message);

        const originalPrompt = `${userInfo}\nUser: ${message.content}\nAI:`;

        const config = {
          model,
          abortSignal: AbortSignal.timeout(60_000),
          prompt: originalPrompt,
          system: systemPrompt,
          providerOptions: options,
        };

        const result = await generateText({
          ...config,
          tools: { ...this.toolsRecord, ...this.defaultTools },
          maxSteps: 5,
        });

        stopTyping();

        if (!!result.text) {
          await message.reply({
            content: result.text.substring(0, 2000),
            allowedMentions: { parse: [] },
          });
        }
      } catch (e) {
        Logger.error(`Error processing AI message: ${e}`);
        const channel = message.channel as TextChannel;

        if (channel.isSendable()) {
          await message
            .reply({
              content: 'An error occurred while processing your request.',
              allowedMentions: { parse: [] },
            })
            .catch((e) => Logger.error(`Failed to send error message: ${e}`));
        }
      } finally {
        stopTyping();
      }
    });
  }

  private async startTyping(channel: TextChannel): Promise<() => void> {
    let stopped = false;

    const runner = async () => {
      if (stopped) return clearInterval(typingInterval);

      if (channel.isSendable()) {
        await channel.sendTyping().catch(Object);
      }
    };

    const typingInterval = setInterval(runner, 3000).unref();

    await runner();

    return () => {
      stopped = true;
      clearInterval(typingInterval);
    };
  }

  public async onBeforeCommandsLoad(
    ctx: CommandKitPluginRuntime,
  ): Promise<void> {
    this.toolsRecord = {};
  }

  async onAfterCommandsLoad(ctx: CommandKitPluginRuntime): Promise<void> {
    const commands = ctx.commandkit.commandHandler
      .getCommandsArray()
      .filter(
        (command) =>
          'ai' in command.data &&
          typeof command.data.ai === 'function' &&
          'aiConfig' in command.data,
      );

    if (!commands.length) {
      Logger.warn(
        'No commands with AI functionality found. Ensure commands are properly configured.',
      );
      return;
    }

    const tools = new Collection<string, WithAI<LoadedCommand>>();

    for (const command of commands) {
      const cmd = command as WithAI<LoadedCommand>;
      if (!cmd.data.ai || !cmd.data.aiConfig) {
        continue;
      }

      const description =
        cmd.data.aiConfig.description || cmd.data.command.description;

      const cmdTool = tool({
        description,
        type: 'function',
        parameters: cmd.data.aiConfig.parameters,
        async execute(params) {
          const ctx = getAiWorkerContext();
          ctx.ctx.setParams(params);

          return cmd.data.ai(ctx.ctx);
        },
      });

      cmd.tool = cmdTool;

      tools.set(cmd.command.name, cmd);
    }

    this.toolsRecord = Object.fromEntries(
      tools.map((toolCmd) => {
        return [toolCmd.command.name, toolCmd.tool];
      }),
    );
  }
}
