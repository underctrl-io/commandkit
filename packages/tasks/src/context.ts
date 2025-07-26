import type { CommandKit, Client } from 'commandkit';
import { Task } from './task';

/**
 * Data structure for creating a task execution context.
 *
 * This interface contains all the necessary information to create a task context,
 * including the task instance, custom data, and CommandKit instance.
 */
export interface TaskContextData<
  T extends Record<string, any> = Record<string, any>,
> {
  /** The task instance that is being executed */
  task: Task;
  /** Custom data passed to the task execution */
  data: T;
  /** The CommandKit instance for accessing bot functionality */
  commandkit: CommandKit;
}

/**
 * Execution context provided to task functions.
 *
 * This class provides access to the task instance, custom data, CommandKit instance,
 * and a temporary store for sharing data between prepare and execute functions.
 *
 * @example
 * ```ts
 * import { task } from '@commandkit/tasks';
 *
 * export default task({
 *   name: 'reminder',
 *   async execute(ctx) {
 *     // Access custom data passed to the task
 *     const { userId, message } = ctx.data;
 *
 *     // Access CommandKit and Discord.js client
 *     const user = await ctx.commandkit.client.users.fetch(userId);
 *     await user.send(`Reminder: ${message}`);
 *
 *     // Use the store to share data between prepare and execute
 *     const processedCount = ctx.store.get('processedCount') || 0;
 *     ctx.store.set('processedCount', processedCount + 1);
 *   },
 * });
 * ```
 */
export class TaskContext<T extends Record<string, any> = Record<string, any>> {
  /**
   * Temporary key-value store for sharing data between prepare and execute functions.
   *
   * This store is useful for passing computed values or state between the prepare
   * and execute phases of task execution.
   *
   * @example
   * ```ts
   * export default task({
   *   name: 'conditional-task',
   *   async prepare(ctx) {
   *     const shouldRun = await checkConditions();
   *     ctx.store.set('shouldRun', shouldRun);
   *     return shouldRun;
   *   },
   *   async execute(ctx) {
   *     const shouldRun = ctx.store.get('shouldRun');
   *     if (shouldRun) {
   *       await performAction();
   *     }
   *   },
   * });
   * ```
   */
  public readonly store = new Map<string, any>();

  /**
   * Creates a new task execution context.
   *
   * @param _data - The task context data containing task, data, and CommandKit instance
   */
  public constructor(private _data: TaskContextData<T>) {}

  /**
   * Gets the task instance being executed.
   *
   * @returns The Task instance
   */
  public get task(): Task {
    return this._data.task;
  }

  /**
   * Gets the Discord.js client.
   * @returns The Discord.js client
   */
  public get client(): Client {
    return this._data.commandkit.client;
  }

  /**
   * Gets the custom data passed to the task execution.
   *
   * @returns The custom data object
   */
  public get data(): T {
    return this._data.data;
  }

  /**
   * Gets the CommandKit instance for accessing bot functionality.
   *
   * This provides access to the Discord.js client, CommandKit store, and other
   * bot-related functionality.
   *
   * @returns The CommandKit instance
   */
  public get commandkit(): CommandKit {
    return this._data.commandkit;
  }
}
