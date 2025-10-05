import { TaskContext } from './context';
import { TaskData, TaskDefinition, TaskSchedule } from './types';

/**
 * Represents a task instance with execution logic and metadata.
 *
 * Tasks can be scheduled to run at specific times or intervals using cron expressions
 * or date-based scheduling. They support preparation logic to conditionally execute
 * and provide a context for accessing CommandKit and Discord.js functionality.
 *
 * @example
 * ```ts
 * import { task } from '@commandkit/tasks';
 *
 * export default task({
 *   name: 'cleanup-old-data',
 *   schedule: '0 2 * * *', // Daily at 2 AM
 *   async prepare(ctx) {
 *     // Only run if there's old data to clean
 *     return await hasOldData();
 *   },
 *   async execute(ctx) {
 *     await cleanupOldRecords();
 *     await ctx.commandkit.client.channels.cache
 *       .get('log-channel')?.send('Cleanup completed!');
 *   },
 * });
 * ```
 */
export class Task<T extends Record<string, any> = Record<string, any>> {
  /**
   * Creates a new task instance.
   *
   * @param data - The task definition containing name, schedule, and execution logic
   */
  public constructor(private data: TaskDefinition<T>) {}

  /**
   * Whether this task should run immediately when created.
   * Only applicable to cron tasks, defaults to false.
   */
  public get immediate(): boolean {
    if (this.isCron()) return !!this.data.immediate;
    return false;
  }

  /**
   * The unique identifier for this task.
   */
  public get name(): string {
    return this.data.name;
  }

  /**
   * The schedule configuration for this task.
   * Returns null if no schedule is defined (manual execution only).
   */
  public get schedule(): TaskSchedule | null {
    return this.data.schedule ?? null;
  }

  /**
   * Checks if this task uses cron-based scheduling.
   *
   * @returns true if the task has a cron schedule
   */
  public isCron(): boolean {
    return typeof this.schedule === 'string';
  }

  /**
   * Checks if this task uses date-based scheduling.
   *
   * @returns true if the task has a date schedule
   */
  public isDate(): boolean {
    if (this.schedule == null) return false;
    return this.schedule instanceof Date || typeof this.schedule === 'number';
  }

  /**
   * The timezone for the task schedule.
   * Returns undefined if no timezone is defined.
   */
  public get timezone(): string | undefined {
    return this.data.timezone ?? undefined;
  }

  /**
   * Determines if the task is ready to be executed.
   *
   * This method calls the optional prepare function if defined. If no prepare
   * function is provided, the task is always ready to execute.
   *
   * @param ctx - The task execution context
   * @returns true if the task should execute, false to skip this run
   */
  public async prepare(ctx: TaskContext<T>): Promise<boolean> {
    return this.data.prepare?.(ctx) ?? true;
  }

  /**
   * Executes the task's main logic.
   *
   * This method calls the execute function defined in the task definition.
   * It provides access to the CommandKit instance, Discord.js client, and
   * any custom data passed to the task.
   *
   * @param ctx - The task execution context containing CommandKit, client, and data
   */
  public async execute(ctx: TaskContext<T>): Promise<void> {
    await this.data.execute(ctx);
  }
}

/**
 * Creates a new task definition.
 *
 * This is the main function for defining tasks in your application. Tasks can be
 * scheduled using cron expressions or specific dates, and can include preparation
 * logic to conditionally execute based on runtime conditions.
 *
 * @example
 * ```ts
 * import { task } from '@commandkit/tasks';
 *
 * // Simple scheduled task
 * export default task({
 *   name: 'daily-backup',
 *   schedule: '0 0 * * *',
 *   async execute(ctx) {
 *     await performBackup();
 *   },
 * });
 * ```
 *
 * @param data - The task definition containing name, schedule, and execution logic
 * @returns A configured Task instance
 */
export function task<T extends Record<string, any> = Record<string, any>>(
  data: TaskDefinition<T>,
): Task<T> {
  return new Task<T>(data);
}
