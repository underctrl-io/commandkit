import { CommandKitPluginRuntime, RuntimePlugin } from 'commandkit/plugin';
import { AiPluginOptions, MessageFilter, SelectAiModel } from './types';
import { LoadedCommand, Logger } from 'commandkit';
import { AiContext } from './context';
import { Collection, Events, Message, TextChannel } from 'discord.js';
import { tool, Tool, generateText } from 'ai';
import { z } from 'zod';
import { getAiWorkerContext, runInAiWorkerContext } from './ai-context-worker';

type WithAI<T extends LoadedCommand> = T & {
  data: {
    ai: (ctx: AiContext) => Promise<unknown> | unknown;
    aiConfig: AiConfig;
  } & T['data'];
  tool: Tool;
};

export interface AiConfig {
  description?: string;
  parameters: any;
}

let messageFilter: MessageFilter | null = null;
let selectAiModel: SelectAiModel | null = null;
let generateSystemPrompt: ((message: Message) => Promise<string>) | undefined;

export interface ConfigureAI {
  messageFilter?: MessageFilter;
  selectAiModel?: SelectAiModel;
  systemPrompt?: (message: Message) => Promise<string>;
}

export function configureAI(config: ConfigureAI): void {
  if (config.messageFilter) {
    messageFilter = config.messageFilter;
  }

  if (config.selectAiModel) {
    selectAiModel = config.selectAiModel;
  }

  if (config.systemPrompt) {
    generateSystemPrompt = config.systemPrompt;
  }
}

export class AiPlugin extends RuntimePlugin<AiPluginOptions> {
  public readonly name = 'AiPlugin';
  private toolsRecord: Record<string, Tool> = {};
  private defaultTools: Record<string, Tool> = {};
  private onMessageFunc: ((message: Message) => Promise<void>) | null = null;

  public constructor(options: AiPluginOptions) {
    super(options);
  }

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    this.onMessageFunc = (message) => this.handleMessage(ctx, message);
    ctx.commandkit.client.on(Events.MessageCreate, this.onMessageFunc);

    this.createDefaultTools(ctx);

    Logger.info(`Plugin ${this.name} activated`);
  }

  private createDefaultTools(ctx: CommandKitPluginRuntime): void {
    const { commandkit } = ctx;
    const client = commandkit.client;

    this.defaultTools.getUserById = tool({
      description: 'Get user information by ID',
      parameters: z.object({
        userId: z
          .string()
          .describe(
            'The ID of the user to retrieve. This is a Discord snowflake string.',
          ),
      }),
      execute: async (params) => {
        const user = await client.users.fetch(params.userId, {
          force: false,
          cache: true,
        });

        return user.toJSON();
      },
    });

    this.defaultTools.getChannelById = tool({
      description: 'Get channel information by ID',
      parameters: z.object({
        channelId: z
          .string()
          .describe(
            'The ID of the channel to retrieve. This is a Discord snowflake string.',
          ),
      }),
      execute: async (params) => {
        const channel = await client.channels.fetch(params.channelId, {
          force: false,
          cache: true,
        });

        if (!channel) {
          throw new Error(`Channel with ID ${params.channelId} not found.`);
        }

        return channel.toJSON();
      },
    });

    this.defaultTools.getGuildById = tool({
      description: 'Get guild information by ID',
      parameters: z.object({
        guildId: z
          .string()
          .describe(
            'The ID of the guild to retrieve. This is a Discord snowflake string.',
          ),
      }),
      execute: async (params) => {
        const guild = await client.guilds.fetch({
          guild: params.guildId,
          force: false,
          cache: true,
        });

        if (!guild) {
          throw new Error(`Guild with ID ${params.guildId} not found.`);
        }

        return {
          id: guild.id,
          name: guild.name,
          icon: guild.iconURL(),
          memberCount: guild.memberCount,
        };
      },
    });

    this.defaultTools.getCurrentUser = tool({
      description: 'Get information about the current discord bot user',
      parameters: z.object({}),
      execute: async () => {
        const user = client.user;

        if (!user) {
          throw new Error('Bot user is not available.');
        }

        return user.toJSON();
      },
    });

    this.defaultTools.getAvailableCommands = tool({
      description: 'Get all available commands',
      parameters: z.object({}),
      execute: async () => {
        return ctx.commandkit.commandHandler.getCommandsArray().map((cmd) => ({
          name: cmd.data.command.name,
          description: cmd.data.command.description,
          category: cmd.command.category,
        }));
      },
    });
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
      (await generateSystemPrompt?.(message)) ||
      `You are a helpful AI discord bot. Your name is ${message.client.user.username} and your id is ${message.client.user.id}.
      You are designed to assist users with their questions and tasks. You also have access to various tools that can help you perform tasks.
      Tools are basically like commands that you can execute to perform specific actions based on user input.
      Keep the response short and concise, and only use tools when necessary. Keep the response length under 2000 characters.
      Do not include your own text in the response unless necessary. For text formatting, you can use discord's markdown syntax.
      ${message.inGuild() ? `\nYou are currently in a guild named ${message.guild.name} whose id is ${message.guildId}. While in guild, you can fetch member information if needed.` : '\nYou are currently in a direct message with the user.'}`;

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
        const result = await generateText({
          abortSignal: AbortSignal.timeout(60_000),
          model,
          tools: { ...this.toolsRecord, ...this.defaultTools },
          prompt: `${userInfo}\nUser: ${message.content}\nAI:`,
          system: systemPrompt,
          maxSteps: 5,
          providerOptions: options,
        });

        stopTyping();

        if (!!result.text) {
          await message.reply({
            content: result.text,
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
