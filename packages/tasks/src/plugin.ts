import {
  CommandKitPluginRuntime,
  Logger,
  RuntimePlugin,
  Collection,
  CommandKitHMREvent,
  getCurrentDirectory,
  toFileURL,
} from 'commandkit';
import { readdir } from 'node:fs/promises';
import path, { join } from 'node:path';
import { Task } from './task';
import { cwd } from 'node:process';
import { taskDriverManager } from './driver-manager';
import { TaskContext } from './context';
import { existsSync } from 'node:fs';

/**
 * Configuration options for the tasks plugin.
 *
 * Currently, the plugin uses default settings for task loading and HMR.
 * Future versions may support customizing the tasks directory path and HMR behavior.
 */
export interface TasksPluginOptions {
  /**
   * Whether to initialize the default driver.
   *
   * If true, the plugin will initialize the default driver.
   * If false, the plugin will not initialize the default driver.
   *
   * @default true
   */
  initializeDefaultDriver?: boolean;
}

/**
 * CommandKit plugin that provides task management capabilities.
 *
 * This plugin automatically loads task definitions from the `src/app/tasks` directory
 * and manages their execution through configured drivers. It supports hot module
 * replacement (HMR) for development workflows.
 *
 * @example
 * ```ts
 * import { tasks } from '@commandkit/tasks';
 *
 * export default {
 *   plugins: [
 *     tasks(),
 *   ],
 * };
 * ```
 */
export class TasksPlugin extends RuntimePlugin<TasksPluginOptions> {
  /** The plugin name identifier */
  public readonly name = 'tasks';

  /** Collection of loaded task instances indexed by task name */
  public readonly tasks = new Collection<string, Task>();

  /**
   * Activates the tasks plugin.
   *
   * This method:
   * 1. Sets up the task execution runner
   * 2. Loads all task definitions from the tasks directory
   * 3. Schedules tasks that have defined schedules
   *
   * @param ctx - The CommandKit plugin runtime context
   */
  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    if (this.options.initializeDefaultDriver && !taskDriverManager.driver) {
      try {
        const { SQLiteDriver } =
          require('./drivers/sqlite') as typeof import('./drivers/sqlite');

        taskDriverManager.setDriver(new SQLiteDriver());
      } catch (e: any) {
        Logger.error(
          `Failed to initialize the default driver for tasks plugin: ${e?.stack || e}`,
        );
      }
    }

    taskDriverManager.setTaskRunner(async (task) => {
      try {
        const taskInstance = this.tasks.get(task.name);

        if (!taskInstance) {
          // task does not exist so we delete it
          await taskDriverManager.deleteTask(task.name);
          return;
        }

        const context = new TaskContext({
          task: taskInstance,
          data: task.data,
          commandkit: ctx.commandkit,
        });

        const prepared = await taskInstance.prepare(context);
        if (!prepared) return;

        await taskInstance.execute(context);
      } catch (e: any) {
        Logger.error(`Error executing task: ${e?.stack ?? e}`);
      }
    });

    await this.loadTasks();
    Logger.info('Tasks plugin activated!');
  }

  /**
   * Deactivates the tasks plugin.
   *
   * Clears all loaded tasks from memory.
   *
   * @param ctx - The CommandKit plugin runtime context
   */
  public async deactivate(ctx: CommandKitPluginRuntime): Promise<void> {
    this.tasks.clear();
    Logger.info('Tasks plugin deactivated!');
  }

  /**
   * Gets the default tasks directory path.
   *
   * @returns The absolute path to the tasks directory
   */
  private getTaskDirectory(): string {
    return path.join(getCurrentDirectory(), 'app', 'tasks');
  }

  /**
   * Loads all task definitions from the tasks directory.
   *
   * This method scans the tasks directory for TypeScript/JavaScript files and
   * imports them as task definitions. It validates that each export is a valid
   * Task instance and schedules tasks that have defined schedules.
   *
   * @param commandkit - The CommandKit instance
   */
  private async loadTasks(): Promise<void> {
    const taskDirectory = this.getTaskDirectory();

    if (!existsSync(taskDirectory)) return;

    const files = await readdir(taskDirectory, { withFileTypes: true });

    for (const file of files) {
      if (
        file.isDirectory() ||
        file.name.startsWith('_') ||
        !/\.(c|m)?(j|t)sx?$/.test(file.name)
      ) {
        continue;
      }

      const taskPath = path.join(file.parentPath, file.name);

      const task = await import(toFileURL(taskPath, true))
        .then((m) => m.default || m)
        .catch((e) => {
          Logger.error(`Error loading task file: ${e?.stack ?? e}`);
          return null;
        });

      if (!task || !(task instanceof Task)) {
        continue;
      }

      if (this.tasks.has(task.name)) {
        Logger.error(
          `Duplicate task found: ${task.name} at src/app/tasks/${file.name}`,
        );
        continue;
      }

      if (task.schedule) {
        await taskDriverManager.createTask({
          name: task.name,
          data: {},
          schedule: task.schedule,
        });
      }

      this.tasks.set(task.name, task);

      Logger.info(`Loaded task: ${task.name}`);
    }

    Logger.info(`Loaded ${this.tasks.size} tasks`);
  }

  /**
   * Handles hot module replacement (HMR) for task files.
   *
   * When a task file is modified during development, this method reloads the
   * task definition and updates the scheduler accordingly.
   *
   * @param ctx - The CommandKit plugin runtime context
   * @param event - The HMR event containing file change information
   */
  public async performHMR(
    ctx: CommandKitPluginRuntime,
    event: CommandKitHMREvent,
  ): Promise<void> {
    if (event.event !== 'unknown') return;

    if (!event.path.startsWith(join(cwd(), 'src', 'app', 'tasks'))) {
      return;
    }

    event.preventDefault();
    event.accept();

    const taskData = await import(toFileURL(event.path, true))
      .then((t) => t.default || t)
      .catch((e) => {
        Logger.error(`Error loading task file: ${e?.stack ?? e}`);
        return null;
      });

    if (!taskData || !(taskData instanceof Task)) return;

    if (this.tasks.has(taskData.name)) {
      Logger.info(`Reloading task: ${taskData.name}`);
      await taskDriverManager.deleteTask(taskData.name);
      this.tasks.set(taskData.name, taskData);
      if (taskData.schedule) {
        await taskDriverManager.createTask({
          name: taskData.name,
          data: {},
          schedule: taskData.schedule,
        });
      }
    } else {
      Logger.info(`Loading task: ${taskData.name}`);
      this.tasks.set(taskData.name, taskData);
      if (taskData.schedule) {
        await taskDriverManager.createTask({
          name: taskData.name,
          data: {},
          schedule: taskData.schedule,
        });
      }
    }
  }
}
