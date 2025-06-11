import { Interaction, Message } from 'discord.js';
import {
  isPlugin,
  PluginCommon,
  PluginOptions,
  PluginType,
} from './PluginCommon';
import type { CommandKitPluginRuntime } from './plugin-runtime/CommandKitPluginRuntime';
import { CommandBuilderLike, PreparedAppCommandExecution } from '../app';
import { CommandKitEnvironment } from '../context/environment';
import { CommandKitHMREvent } from '../utils/dev-hooks';
import { PreRegisterCommandsEvent } from '../app/register/CommandRegistrar';
import { CommandKitEventDispatch } from './types';

/**
 * CommandKit plugin that runs at the runtime.
 */
export abstract class RuntimePlugin<
  T extends PluginOptions = PluginOptions,
> extends PluginCommon<T, CommandKitPluginRuntime> {
  public readonly type = PluginType.Runtime;
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

  /**
   * Called before command is loaded for registration. This method can be used to modify the command data before it is loaded.
   * @param ctx The context
   * @param commands The command that is being loaded. This is a CommandBuilderLike object which represents Discord's command
   */
  async prepareCommand(
    ctx: CommandKitPluginRuntime,
    commands: CommandBuilderLike,
  ): Promise<CommandBuilderLike | null> {
    return null;
  }

  /**
   * Called before command is registered to discord. This method can cancel the registration of the command and handle it manually.
   * @param ctx The context
   * @param data The command registration data
   */
  async onBeforeRegisterCommands(
    ctx: CommandKitPluginRuntime,
    event: PreRegisterCommandsEvent,
  ): Promise<void> {}

  /**
   * Called before global commands registration. This method can cancel the registration of the command and handle it manually.
   * This method is called after `onBeforeRegisterCommands` if that stage was not handled.
   * @param ctx The context
   * @param event The command registration data
   */
  async onBeforeRegisterGlobalCommands(
    ctx: CommandKitPluginRuntime,
    event: PreRegisterCommandsEvent,
  ): Promise<void> {}

  /**
   * Called before guild commands registration. This method can cancel the registration of the command and handle it manually.
   * This method is called before guilds of the command are resolved. It is called after `onBeforeRegisterCommands` if that stage was not handled.
   * @param ctx The context
   * @param event The command registration data
   */
  async onBeforePrepareGuildCommandsRegistration(
    ctx: CommandKitPluginRuntime,
    event: PreRegisterCommandsEvent,
  ): Promise<void> {}

  /**
   * Called before guild commands registration. This method can cancel the registration of the command and handle it manually.
   * This method is called after guilds of the command are resolved. It is called after `onBeforePrepareGuildCommandsRegistration` if that stage was not handled.
   * @param ctx The context
   * @param event The command registration data
   */
  async onBeforeRegisterGuildCommands(
    ctx: CommandKitPluginRuntime,
    event: PreRegisterCommandsEvent,
  ): Promise<void> {}

  /**
   * Called after command and all of its deferred functions are executed.
   * @param ctx The context
   * @param env The environment of the command. This environment contains the command execution data such as command context and more.
   */
  async onAfterCommand(
    ctx: CommandKitPluginRuntime,
    env: CommandKitEnvironment,
  ) {}

  /**
   * Called before emitting an event
   * @param ctx The context
   * @param event The event that is being emitted
   */
  public async willEmitEvent(
    ctx: CommandKitPluginRuntime,
    event: CommandKitEventDispatch,
  ) {}
}

export function isRuntimePlugin(plugin: unknown): plugin is RuntimePlugin {
  return (
    plugin instanceof RuntimePlugin ||
    (isPlugin(plugin) && plugin.type === PluginType.Runtime)
  );
}
