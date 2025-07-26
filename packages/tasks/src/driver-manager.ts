import { TaskDriver, TaskRunner } from './driver';
import { PartialTaskData, TaskData } from './types';

/**
 * Manages the active task driver and provides a unified interface for task operations.
 *
 * This class acts as a facade for the underlying task driver, providing methods
 * to create, delete, and manage tasks. It ensures that a driver is set before
 * any operations are performed.
 *
 * @example
 * ```ts
 * import { TaskDriverManager } from '@commandkit/tasks';
 *
 * const manager = new TaskDriverManager();
 * // Set your preferred driver here
 *
 * // Now you can create and manage tasks
 * const taskId = await manager.createTask({
 *   name: 'my-task',
 *   data: { userId: '123' },
 *   schedule: { type: 'date', value: Date.now() + 60000 },
 * });
 * ```
 */
export class TaskDriverManager {
  private driver: TaskDriver | null = null;

  /**
   * Sets the active task driver.
   *
   * This method must be called before any task operations can be performed.
   * The driver handles all scheduling, persistence, and execution timing.
   *
   * @param driver - The task driver to use for all operations
   */
  public setDriver(driver: TaskDriver): void {
    this.driver = driver;
  }

  /**
   * Creates a new scheduled task.
   *
   * This method delegates to the active driver to schedule the task according
   * to its configuration. The task will be executed when its schedule is due.
   *
   * @param task - The task data containing name, schedule, and custom data
   * @returns A unique identifier for the created task
   * @throws {Error} If no driver has been set
   */
  public async createTask(task: TaskData): Promise<string> {
    if (!this.driver) throw new Error('Task driver has not been set');

    return await this.driver.create(task);
  }

  /**
   * Deletes a scheduled task by its identifier.
   *
   * This method delegates to the active driver to remove the task from the
   * scheduling system and cancel any pending executions.
   *
   * @param identifier - The unique identifier of the task to delete
   * @throws {Error} If no driver has been set
   */
  public async deleteTask(identifier: string): Promise<void> {
    if (!this.driver) throw new Error('Task driver has not been set');

    await this.driver.delete(identifier);
  }

  /**
   * Sets the task execution runner function.
   *
   * This method delegates to the active driver to set up the execution handler
   * that will be called when tasks are due to run.
   *
   * @param runner - The function to call when a task should be executed
   * @throws {Error} If no driver has been set
   */
  public async setTaskRunner(runner: TaskRunner): Promise<void> {
    if (!this.driver) throw new Error('Task driver has not been set');

    await this.driver.setTaskRunner(runner);
  }
}

/**
 * Global task driver manager instance.
 *
 * This is the default instance used by the tasks plugin for managing task operations.
 * You can use this instance directly or create your own TaskDriverManager instance.
 */
export const taskDriverManager = new TaskDriverManager();

/**
 * Sets the global task driver.
 *
 * This is a convenience function that sets the driver on the global task driver manager.
 *
 * @param driver - The task driver to use for all operations
 *
 * @example
 * ```ts
 * import { setDriver } from '@commandkit/tasks';
 * import { SQLiteDriver } from '@commandkit/tasks/sqlite';
 *
 * setDriver(new SQLiteDriver('./tasks.db'));
 * ```
 */
export function setDriver(driver: TaskDriver): void {
  taskDriverManager.setDriver(driver);
}

/**
 * Creates a new scheduled task using the global driver manager.
 *
 * This is a convenience function that creates a task using the global task driver manager.
 *
 * @param task - The task data containing name, schedule, and custom data
 * @returns A unique identifier for the created task
 *
 * @example
 * ```ts
 * import { createTask } from '@commandkit/tasks';
 *
 * const taskId = await createTask({
 *   name: 'reminder',
 *   data: { userId: '123', message: 'Hello!' },
 *   schedule: { type: 'date', value: Date.now() + 60000 },
 * });
 * ```
 */
export function createTask(task: TaskData): Promise<string> {
  return taskDriverManager.createTask(task);
}

/**
 * Deletes a scheduled task using the global driver manager.
 *
 * This is a convenience function that deletes a task using the global task driver manager.
 *
 * @param identifier - The unique identifier of the task to delete
 *
 * @example
 * ```ts
 * import { deleteTask } from '@commandkit/tasks';
 *
 * await deleteTask('task-123');
 * ```
 */
export function deleteTask(identifier: string): Promise<void> {
  return taskDriverManager.deleteTask(identifier);
}
