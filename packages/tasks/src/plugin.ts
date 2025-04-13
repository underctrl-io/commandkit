import {
  AsyncFunction,
  CommandKitPluginRuntime,
  Logger,
  RuntimePlugin,
} from 'commandkit';
import { TaskManager } from './TaskManager';

export type ConfigureHook = AsyncFunction<[TaskManager]>;

export interface TaskPluginOptions {}

const hooks = new Set<ConfigureHook>();

export function configureTaskManager(cb: ConfigureHook) {
  hooks.add(cb);
}

export class TaskPlugin extends RuntimePlugin<TaskPluginOptions> {
  public readonly name = 'TaskPlugin';
  private manager: TaskManager | null = null;

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    this.manager = new TaskManager(ctx.commandkit);

    await this.#initializeHooks();
  }

  async #initializeHooks() {
    if (!this.manager) {
      throw new Error('TaskManager is not initialized');
    }

    for (const hook of hooks) {
      try {
        await hook(this.manager);
      } catch (e) {
        Logger.error(`Failed to execute task manager hook: ${hook.name}`, e);
      }
    }

    hooks.clear();
  }

  public async deactivate(): Promise<void> {
    await this.manager.destroy();
    this.manager = null;
    hooks.clear();
  }
}
