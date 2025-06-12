import { CommandKitPluginRuntime, RuntimePlugin } from 'commandkit/plugin';
import { AiPluginOptions, CommandTool } from './types';
import CommandKit, { getCommandKit, Logger } from 'commandkit';
import { AiContext } from './context';
import { Collection, Events, Message } from 'discord.js';
import { tool, Tool, generateText } from 'ai';
import { getAiWorkerContext, runInAiWorkerContext } from './ai-context-worker';
import { getAvailableCommands } from './tools/get-available-commands';
import { getChannelById } from './tools/get-channel-by-id';
import { getCurrentClientInfo } from './tools/get-current-client-info';
import { getGuildById } from './tools/get-guild-by-id';
import { getUserById } from './tools/get-user-by-id';
import { AiMessage, getAIConfig } from './configure';
import { augmentCommandKit } from './augmentation';

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
    this.onMessageFunc = (message) =>
      this.handleMessage(ctx.commandkit, message);
    ctx.commandkit.client.on(Events.MessageCreate, this.onMessageFunc);
    augmentCommandKit(true);

    Logger.info(`Plugin ${this.name} activated`);
  }

  public async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    this.toolsRecord = {};
    if (this.onMessageFunc) {
      ctx.commandkit.client.off(Events.MessageCreate, this.onMessageFunc);
      this.onMessageFunc = null;
    }
    augmentCommandKit(false);
    Logger.info(`Plugin ${this.name} deactivated`);
  }

  private async handleMessage(
    commandkit: CommandKit,
    message: Message,
  ): Promise<void> {
    if (message.author.bot || !Object.keys(this.toolsRecord).length) return;
    const {
      messageFilter,
      selectAiModel,
      prepareSystemPrompt,
      preparePrompt,
      onProcessingFinish,
      onProcessingStart,
      onResult,
      onError,
      disableBuiltInTools,
    } = getAIConfig();

    if (!message.content?.length) return;

    if (!message.channel.isTextBased() || !message.channel.isSendable()) return;

    const shouldContinue = messageFilter ? await messageFilter(message) : true;
    if (!shouldContinue) return;

    const ctx = new AiContext<any>({
      message,
      params: {},
      commandkit: commandkit,
    });

    await runInAiWorkerContext(ctx, message, async () => {
      const systemPrompt = await prepareSystemPrompt(ctx, message);
      const prompt = await preparePrompt(ctx, message);
      const { model, abortSignal, maxSteps, ...modelOptions } =
        await selectAiModel(ctx, message);

      const promptOrMessage =
        typeof prompt === 'string' ? { prompt } : { messages: prompt };

      await onProcessingStart(ctx, message);

      try {
        const result = await generateText({
          model,
          abortSignal: abortSignal ?? AbortSignal.timeout(60_000),
          system: systemPrompt,
          maxSteps: maxSteps ?? 5,
          ...modelOptions,
          tools: {
            // Include built-in least significant tools if not disabled
            ...(!disableBuiltInTools && this.defaultTools),
            // include tools added by configureAI()
            // this should be able to override built-in tools
            ...modelOptions.tools,
            // include tools added by commands at last since
            // they are the most specific and should override others
            ...this.toolsRecord,
          },
          ...promptOrMessage,
        });

        await onResult(ctx, message, result);
      } catch (e) {
        await onError(ctx, message, e as Error);
      } finally {
        await onProcessingFinish(ctx, message);
      }
    });
  }

  /**
   * Executes the AI for a given message.
   * @param message The message to process.
   * @param commandkit The CommandKit instance to use. If not provided, it will be inferred automatically.
   */
  public async executeAI(
    message: Message,
    commandkit?: CommandKit,
  ): Promise<void> {
    commandkit ??= getCommandKit(true);
    return this.handleMessage(commandkit, message);
  }

  public async onBeforeCommandsLoad(): Promise<void> {
    this.toolsRecord = {};
  }

  async onAfterCommandsLoad(ctx: CommandKitPluginRuntime): Promise<void> {
    const { commandkit } = ctx;
    const commands = commandkit.commandHandler
      .getCommandsArray()
      .filter(
        (command) =>
          'ai' in command.data &&
          typeof command.data.ai === 'function' &&
          'aiConfig' in command.data,
      );

    if (!commands.length) {
      return;
    }

    const tools = new Collection<string, CommandTool>();

    for (const command of commands) {
      const cmd = command as CommandTool;
      if (!cmd.data.ai || !cmd.data.aiConfig) {
        continue;
      }

      const description =
        cmd.data.aiConfig.description || cmd.data.command.description;

      const cmdTool = tool({
        description,
        parameters: cmd.data.aiConfig.parameters,
        async execute(params) {
          const config = getAIConfig();
          const ctx = getAiWorkerContext();

          ctx.ctx.setParams(params);

          try {
            const target = await commandkit.commandHandler.prepareCommandRun(
              ctx.message,
              cmd.data.command.name,
            );

            if (!target) {
              return {
                error: true,
                message: 'This command is not available.',
              };
            }

            const res =
              await commandkit.commandHandler.commandRunner.runCommand(
                target,
                ctx.message,
                {
                  handler: 'ai',
                  throwOnError: true,
                },
              );

            return res === undefined ? { success: true } : res;
          } catch (e) {
            await config.onError?.(ctx.ctx, ctx.message, e as Error);

            return {
              error: true,
              message: 'This tool failed with unexpected error.',
            };
          }
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
