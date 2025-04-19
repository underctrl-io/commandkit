import {
  AsyncFunction,
  CommandKitPluginRuntime,
  Logger,
  RuntimePlugin,
} from 'commandkit';
import { TaskManager } from './TaskManager';

export type ConfigureHook = AsyncFunction<[TaskManager]>;

export interface TaskPluginOptions {
  /**
   * Path to the tasks directory. Default is app/tasks.
   */
  tasksDir?: string;
}

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

    // Initialize task manager after hooks have been run
    try {
      await this.manager.initialize();
    } catch (error) {
      Logger.error('Failed to initialize TaskManager:', error);
    }

    Logger.info('Task plugin activated');
  }

  async #initializeHooks() {
    if (!this.manager) {
      throw new Error('TaskManager is not initialized');
    }

    for (const hook of hooks) {
      try {
        await hook(this.manager);
      } catch (error) {
        Logger.error('Error in task hook:', error);
      }
    }
  }

  public async deactivate(): Promise<void> {
    await this.manager?.destroy();
  }
}
