import { PartialTaskData, TaskData, TaskExecutionData } from './types';

/**
 * Interface for task persistence and scheduling drivers.
 *
 * Drivers handle the actual scheduling, persistence, and execution timing of tasks.
 * Different drivers can provide different persistence mechanisms (in-memory, database, etc.)
 * and scheduling capabilities.
 *
 * @example
 * ```ts
 * import { TaskDriver } from '@commandkit/tasks';
 *
 * class CustomDriver implements TaskDriver {
 *   async create(task: TaskData): Promise<string> {
 *     // Schedule the task in your system
 *     const id = await this.scheduler.schedule(task);
 *     return id;
 *   }
 *
 *   async delete(task: string): Promise<void> {
 *     // Remove the task from your system
 *     await this.scheduler.cancel(task);
 *   }
 *
 *   async setTaskRunner(runner: TaskRunner): Promise<void> {
 *     // Set up the execution handler
 *     this.runner = runner;
 *   }
 * }
 * ```
 */
export interface TaskDriver {
  /**
   * Creates a new scheduled task.
   *
   * This method should schedule the task according to its schedule configuration
   * and return a unique identifier that can be used to delete the task later.
   * Multiple tasks may be created with the same name.
   *
   * @param task - The task data containing name, schedule, and custom data
   * @returns A unique identifier for the created task
   */
  create(task: TaskData): Promise<string>;

  /**
   * Deletes a scheduled task by its identifier.
   *
   * This method should remove the task from the scheduling system and cancel
   * any pending executions. If the task doesn't exist, this method should
   * complete successfully without throwing an error.
   *
   * @param task - The unique identifier of the task to delete
   */
  delete(task: string): Promise<void>;

  /**
   * Sets the task execution runner function.
   *
   * This method should store the provided runner function and call it whenever
   * a task is due for execution. The runner function receives the task execution
   * data and should handle any errors that occur during execution.
   *
   * @param runner - The function to call when a task should be executed
   */
  setTaskRunner(runner: TaskRunner): Promise<void>;
}

/**
 * Function type for executing tasks.
 *
 * This function is called by the driver when a task is scheduled to run.
 * It receives the task execution data and should handle the actual execution
 * of the task logic.
 *
 * @param task - The task execution data containing name, custom data, and timestamp
 */
export type TaskRunner = (task: TaskExecutionData) => Promise<void>;
