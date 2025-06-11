import { Collection } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import { RuntimePlugin } from '../RuntimePlugin';
import {
  CommandKitErrorCodes,
  createCommandKitError,
  isErrorType,
} from '../../utils/error-codes';
import { Logger } from '../../logger/Logger';
import { AsyncFunction } from '../../context/async-context';

/**
 * Represents the runtime environment for CommandKit plugins.
 */
export class CommandKitPluginRuntime {
  private plugins = new Collection<string, RuntimePlugin>();

  /**
   * Creates a new instance of CommandKitPluginRuntime.
   * @param commandkit The CommandKit instance associated with this runtime.
   */
  public constructor(public readonly commandkit: CommandKit) {}

  /**
   * Returns the plugins registered in this runtime.
   * @returns A collection of plugins.
   */
  public getPlugins() {
    return this.plugins;
  }

  /**
   * Checks if there are no plugins registered in this runtime.
   * @returns Boolean indicating whether the runtime is empty.
   */
  public getPlugin(pluginName: string): RuntimePlugin | null {
    return this.plugins.get(pluginName) ?? null;
  }

  /**
   * Soft registers a plugin in the runtime.
   * @param plugin The plugin to be registered.
   */
  public async softRegisterPlugin(plugin: RuntimePlugin) {
    const pluginName = plugin.name;

    if (this.plugins.has(pluginName)) return;

    try {
      await plugin.activate(this);
      this.plugins.set(pluginName, plugin);
    } catch (e: any) {
      throw new Error(
        `Failed to activate plugin "${pluginName}": ${e?.stack || e}`,
      );
    }
  }

  /**
   * Registers a plugin in the runtime.
   * @param plugin The plugin to be registered.
   * @throws If a plugin with the same name already exists.
   */
  public async registerPlugin(plugin: RuntimePlugin) {
    const pluginName = plugin.name;

    if (this.plugins.has(pluginName)) {
      throw new Error(`Plugin with name "${pluginName}" already exists.`);
    }

    try {
      await plugin.activate(this);
      this.plugins.set(pluginName, plugin);
    } catch (e: any) {
      throw new Error(
        `Failed to activate plugin "${pluginName}": ${e?.stack || e}`,
      );
    }
  }

  /**
   * Unregisters a plugin from the runtime.
   * @param plugin The plugin to be unregistered.
   * @throws If the plugin does not exist.
   */
  public async unregisterPlugin(plugin: RuntimePlugin) {
    const pluginName = plugin.name;

    if (!this.plugins.has(pluginName)) {
      throw new Error(`Plugin with name "${pluginName}" does not exist.`);
    }

    this.plugins.delete(pluginName);

    try {
      await plugin.deactivate(this);
    } catch (e: any) {
      throw new Error(
        `Failed to deactivate plugin "${pluginName}": ${e?.stack || e}`,
      );
    }
  }

  /**
   * Unregisters all plugins from the runtime.
   */
  public async unregisterAllPlugins() {
    for (const plugin of this.plugins.values()) {
      await this.unregisterPlugin(plugin);
    }
  }

  /**
   * Signals the runtime to allow the current plugin take ownership of the execution context.
   */
  public capture() {
    throw createCommandKitError(CommandKitErrorCodes.PluginCaptureHandle);
  }

  /**
   * Executes a function for each plugin in the runtime.
   * @param f The function to execute for each plugin.
   * @returns The result of the last executed function, or undefined if no plugins were executed.
   */
  public async execute<R = any>(
    f: AsyncFunction<[CommandKitPluginRuntime, RuntimePlugin], R | undefined>,
  ) {
    let result: R | undefined;
    for (const plugin of this.plugins.values()) {
      try {
        result = await f(this, plugin);
      } catch (e: any) {
        if (isErrorType(e, CommandKitErrorCodes.PluginCaptureHandle)) {
          return true;
        }

        Logger.error(`Plugin "${plugin.name}" failed`, e?.stack || e);
      }
    }

    return result;
  }
}
