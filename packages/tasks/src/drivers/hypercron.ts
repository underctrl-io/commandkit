import { cronService } from 'hypercron';
import { TaskDriver, TaskRunner } from '../driver';
import { TaskData } from '../types';

/**
 * HyperCron-based task driver for lightweight task scheduling.
 *
 * This driver uses HyperCron to provide simple, in-memory task scheduling.
 * It's ideal for single-instance applications or development environments
 * where you don't need distributed task scheduling.
 *
 * **Requirements**: Requires the `hypercron` package to be installed.
 *
 * @example
 * ```ts
 * import { HyperCronDriver } from '@commandkit/tasks/hypercron';
 * import { setDriver } from '@commandkit/tasks';
 *
 * const driver = new HyperCronDriver();
 * setDriver(driver);
 * ```
 *
 * @example
 * ```ts
 * // With custom cron service
 * import { cronService } from 'hypercron';
 *
 * const customService = cronService.create({
 *   // Custom configuration
 * });
 *
 * const driver = new HyperCronDriver(customService);
 * setDriver(driver);
 * ```
 */
export class HyperCronDriver implements TaskDriver {
  private runner: TaskRunner | null = null;

  /**
   * Creates a new HyperCron driver instance.
   *
   * @param service - Optional custom cron service instance, defaults to the global cronService
   */
  public constructor(private readonly service = cronService) {}

  /**
   * Creates a new scheduled task in HyperCron.
   *
   * This schedules the task using the HyperCron service and starts the service
   * if it's not already running.
   *
   * @param task - The task data containing name, schedule, and custom data
   * @returns A unique schedule identifier
   */
  public async create(task: TaskData): Promise<string> {
    const id = await this.service.schedule(
      task.schedule.value,
      task.name,
      async () => {
        if (!this.runner) throw new Error('Task runner has not been set');

        await this.runner({
          name: task.name,
          data: task.data,
          timestamp: Date.now(),
        });
      },
    );

    await this.service.start();

    return id;
  }

  /**
   * Deletes a scheduled task from HyperCron.
   *
   * This cancels the scheduled task and removes it from the cron service.
   *
   * @param identifier - The schedule identifier to delete
   */
  public async delete(identifier: string): Promise<void> {
    await this.service.cancel(identifier);
  }

  /**
   * Sets the task execution runner function.
   *
   * This function will be called by the HyperCron service when a task is due for execution.
   *
   * @param runner - The function to call when a task should be executed
   */
  public async setTaskRunner(runner: TaskRunner): Promise<void> {
    this.runner = runner;
  }
}
