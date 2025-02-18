import { PluginCommon, PluginOptions } from './PluginCommon';
import { CommandKit } from '../CommandKit';

export abstract class RuntimePlugin<
  T extends PluginOptions = PluginOptions,
> extends PluginCommon<T> {
  /**
   * Called before commands are loaded
   * @param commandkit The commandkit instance
   */
  public async onBeforeCommandsLoad(commandkit: CommandKit): Promise<void> {}

  /**
   * Called after commands are loaded
   * @param commandkit The commandkit instance
   */
  public async onAfterCommandsLoad(commandkit: CommandKit): Promise<void> {}

  /**
   * Called before events are loaded
   * @param commandkit The commandkit instance
   */
  public async onBeforeEventsLoad(commandkit: CommandKit): Promise<void> {}

  /**
   * Called after events are loaded
   * @param commandkit The commandkit instance
   */
  public async onAfterEventsLoad(commandkit: CommandKit): Promise<void> {}

  /**
   * Called before the client logs in
   * @param commandkit The commandkit instance
   */
  public async onBeforeClientLogin(commandkit: CommandKit): Promise<void> {}

  /**
   * Called after the client logs in
   * @param commandkit The commandkit instance
   */
  public async onAfterClientLogin(commandkit: CommandKit): Promise<void> {}
}

export function isRuntimePlugin(plugin: unknown): plugin is RuntimePlugin {
  return plugin instanceof RuntimePlugin;
}
