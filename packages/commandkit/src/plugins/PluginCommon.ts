import { randomUUID } from 'node:crypto';
import { CommonPluginRuntime } from './plugin-runtime/runtime';

/**
 * The options for a CommandKit plugin.
 */
export type PluginOptions = Record<string, any>;

/**
 * Enum representing the type of plugin.
 * - Compiler: A plugin that runs at compile time.
 * - Runtime: A plugin that runs at runtime.
 */
export enum PluginType {
  Compiler = 'compiler',
  Runtime = 'runtime',
}

/**
 * Base class for CommandKit plugins.
 */
export abstract class PluginCommon<
  T extends PluginOptions = PluginOptions,
  C extends CommonPluginRuntime = CommonPluginRuntime,
> {
  /**
   * The type of the plugin, either Compiler or Runtime.
   */
  public abstract readonly type: PluginType;
  /**
   * Unique identifier for the plugin instance.
   */
  public readonly id = randomUUID();
  /**
   * The time when the plugin was loaded, in milliseconds since the Unix epoch.
   */
  public readonly loadedAt = Date.now();
  /**
   * The name of the plugin.
   */
  public abstract readonly name: string;

  /**
   * Creates a new instance of the plugin.
   */
  public constructor(protected readonly options: T) {}

  /**
   * Called when this plugin is activated
   */
  public async activate(ctx: C): Promise<void> {}

  /**
   * Called when this plugin is deactivated
   */
  public async deactivate(ctx: C): Promise<void> {}
}

/**
 * Whether the given object is a CommandKit plugin.
 * @param plugin The object to check.
 * @returns Boolean indicating whether the object is a plugin.
 */
export function isPlugin(
  plugin: unknown,
): plugin is PluginCommon<PluginOptions> {
  return plugin instanceof PluginCommon;
}
