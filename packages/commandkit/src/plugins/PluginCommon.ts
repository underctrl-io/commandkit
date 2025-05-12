import { randomUUID } from 'node:crypto';
import { CommonPluginRuntime } from './plugin-runtime/runtime';

export type PluginOptions = Record<string, any>;

export enum PluginType {
  Compiler = 'compiler',
  Runtime = 'runtime',
}

export abstract class PluginCommon<
  T extends PluginOptions = PluginOptions,
  C extends CommonPluginRuntime = CommonPluginRuntime,
> {
  public abstract readonly type: PluginType;
  public readonly id = randomUUID();
  public readonly loadedAt = Date.now();
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
