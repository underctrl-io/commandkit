import { CommonPluginRuntime } from './runtime/runtime';

export type PluginOptions = Record<string, any>;

export abstract class PluginCommon<
  T extends PluginOptions = PluginOptions,
  C extends CommonPluginRuntime = CommonPluginRuntime,
> {
  public abstract readonly name: string;
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

export function isPlugin(
  plugin: unknown,
): plugin is PluginCommon<PluginOptions> {
  return plugin instanceof PluginCommon;
}
