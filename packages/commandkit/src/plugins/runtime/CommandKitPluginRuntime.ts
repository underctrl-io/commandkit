import { Collection, Interaction } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import { RuntimePlugin } from '../RuntimePlugin';
import { AsyncFunction } from '../../cache';
import {
  CommandKitErrorCodes,
  createCommandKitError,
  isCommandKitError,
  isErrorType,
} from '../../utils/error-codes';
import { Logger } from '../../logger/Logger';

export class CommandKitPluginRuntime {
  private plugins = new Collection<string, RuntimePlugin>();

  public constructor(public readonly commandkit: CommandKit) {}

  public getPlugin(pluginName: string): RuntimePlugin | null {
    return this.plugins.get(pluginName) ?? null;
  }

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

  public async unregisterAllPlugins() {
    for (const plugin of this.plugins.values()) {
      await this.unregisterPlugin(plugin);
    }
  }

  public capture() {
    throw createCommandKitError(CommandKitErrorCodes.PluginCaptureHandle);
  }

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
