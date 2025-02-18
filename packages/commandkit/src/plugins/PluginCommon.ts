import { ResolvedCommandKitConfig } from '../config';

export type PluginOptions = Record<string, any>;

export abstract class PluginCommon<T extends PluginOptions> {
  public abstract readonly name: string;
  public constructor(protected readonly options: T) {}

  /**
   * Called when this plugin is activated
   */
  public async activate(config: ResolvedCommandKitConfig): Promise<void> {}

  /**
   * Called when this plugin is deactivated
   */
  public async deactivate(config: ResolvedCommandKitConfig): Promise<void> {}
}

export function isPlugin(
  plugin: unknown,
): plugin is PluginCommon<PluginOptions> {
  return plugin instanceof PluginCommon;
}
