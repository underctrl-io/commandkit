import { Interaction, Message, PartialMessage } from 'discord.js';
import { PluginCommon, PluginOptions } from './PluginCommon';
import type { CommandKitPluginRuntime } from './runtime/CommandKitPluginRuntime';
import { PreparedAppCommandExecution } from '../app';
import { CommandKitEnvironment } from '../context/environment';
import { CommandKitHMREvent } from '../utils/dev-hooks';

export abstract class RuntimePlugin<
  T extends PluginOptions = PluginOptions,
> extends PluginCommon<T, CommandKitPluginRuntime> {
  /**
   * Called before commands are loaded
   */
  public async onBeforeCommandsLoad(
    ctx: CommandKitPluginRuntime,
  ): Promise<void> {}

  /**
   * Called after commands are loaded
   */
  public async onAfterCommandsLoad(
    ctx: CommandKitPluginRuntime,
  ): Promise<void> {}

  /**
   * Called before events are loaded
   */
  public async onBeforeEventsLoad(
    ctx: CommandKitPluginRuntime,
  ): Promise<void> {}

  /**
   * Called after events are loaded
   */
  public async onAfterEventsLoad(ctx: CommandKitPluginRuntime): Promise<void> {}

  /**
   * Called before the client logs in
   */
  public async onBeforeClientLogin(
    ctx: CommandKitPluginRuntime,
  ): Promise<void> {}

  /**
   * Called after the client logs in
   */
  public async onAfterClientLogin(
    ctx: CommandKitPluginRuntime,
  ): Promise<void> {}

  /**
   * Called before interaction is handled
   * @param interaction The interaction
   */
  public async onBeforeInteraction(
    ctx: CommandKitPluginRuntime,
    interaction: Interaction,
  ): Promise<void> {}

  /**
   * Called before message command is processed
   * @param message The message
   */
  public async onBeforeMessageCommand(
    ctx: CommandKitPluginRuntime,
    message: Message,
  ): Promise<void> {}

  /**
   * Called before message update command is processed
   * @param message The message
   */
  public async onBeforeMessageUpdateCommand(
    ctx: CommandKitPluginRuntime,
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage,
  ): Promise<void> {}

  /**
   * Called before command is executed. This method can execute the command itself.
   * @param source The source that triggered the command
   * @param command The command
   * @param execute The function that executes the command
   */
  public async executeCommand(
    ctx: CommandKitPluginRuntime,
    env: CommandKitEnvironment,
    source: Interaction | Message,
    command: PreparedAppCommandExecution,
    execute: () => Promise<any>,
  ): Promise<boolean> {
    return false;
  }

  /**
   * Called after events router is initialized
   * @param ctx The context
   */
  public async onEventsRouterInit(
    ctx: CommandKitPluginRuntime,
  ): Promise<void> {}

  /**
   * Called after commands router is initialized
   * @param ctx The context
   */
  public async onCommandsRouterInit(
    ctx: CommandKitPluginRuntime,
  ): Promise<void> {}

  /**
   * Called when HMR event is received
   * @param ctx The context
   * @param event The event
   */
  public async performHMR(
    ctx: CommandKitPluginRuntime,
    event: CommandKitHMREvent,
  ): Promise<void> {}
}

export function isRuntimePlugin(plugin: unknown): plugin is RuntimePlugin {
  return plugin instanceof RuntimePlugin;
}
