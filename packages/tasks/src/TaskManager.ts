import CommandKit from 'commandkit';
import { ITaskDriver, TaskConfig, TaskExecutor } from './driver';
import { TaskContextManager } from './TaskContextManager';
import { injectContext } from './augmentations';
import path from 'path';
import fs from 'fs/promises';

export class TaskManager {
  private driver: ITaskDriver | null = null;
  private context = new TaskContextManager(this);
  private tasks: Map<string, TaskExecutor> = new Map();

  public constructor(public readonly commandkit: CommandKit) {
    injectContext(this.context);
  }

  public async initialize() {
    if (!this.driver) {
      throw new Error('No task driver has been set. Call useDriver() first.');
    }

    await this.driver.initialize(this.commandkit);
    await this.loadStaticTasks();
  }

  /**
   * Load static tasks from the app/tasks directory
   */
  private async loadStaticTasks() {
    // Access root directory via internal commandkit properties (assuming it's accessible)
    // If this is not possible, the path should be provided during configuration
    const rootPath =
      (this.commandkit as any)._options?.rootPath || process.cwd();
    const tasksDir = path.join(rootPath, 'app', 'tasks');

    try {
      const stats = await fs.stat(tasksDir);
      if (!stats.isDirectory()) return;
    } catch (error) {
      // Directory doesn't exist, that's OK
      return;
    }

    const files = await fs.readdir(tasksDir);

    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;

      const taskPath = path.join(tasksDir, file);
      try {
        const taskModule = await import(taskPath);

        if (!taskModule.default || typeof taskModule.default !== 'function') {
          console.warn(`Task file ${file} does not export a default function`);
          continue;
        }

        const executor = taskModule.default as TaskExecutor;
        const taskName =
          taskModule.config?.name || path.basename(file, path.extname(file));
        const config: TaskConfig = {
          name: taskName,
          pattern: taskModule.config?.pattern,
          every: taskModule.config?.every,
        };

        this.tasks.set(taskName, executor);

        if (config.pattern || config.every) {
          await this.driver?.registerStaticTask(taskName, executor, config);
        }
      } catch (error) {
        console.error(`Failed to load task ${file}:`, error);
      }
    }
  }

  public getExecutor(name: string): TaskExecutor | undefined {
    return this.tasks.get(name);
  }

  public registerExecutor(name: string, executor: TaskExecutor) {
    this.tasks.set(name, executor);
    return this;
  }

  public async destroy() {
    await this.driver?.destroy();
  }

  public useDriver(driver: ITaskDriver) {
    this.driver = driver;
    return this;
  }

  public getDriver(): ITaskDriver | null {
    return this.driver;
  }
}
