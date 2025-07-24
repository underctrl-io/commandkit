import { TasksPlugin, TasksPluginOptions } from './plugin';

/**
 * Creates a tasks plugin instance for CommandKit.
 *
 * This plugin provides task management capabilities including:
 * - Static task definitions with cron and date-based scheduling
 * - Dynamic task creation and management
 * - Hot module replacement (HMR) support for development
 * - Multiple persistence drivers (in-memory, SQLite, BullMQ)
 *
 * @example
 * ```ts
 * import { tasks } from '@commandkit/tasks';
 *
 * export default {
 *   plugins: [
 *     tasks({
 *       tasksPath: 'app/tasks',
 *       enableHMR: true,
 *     }),
 *   ],
 * };
 * ```
 *
 * @param options - Configuration options for the tasks plugin
 * @returns A configured tasks plugin instance
 */
export function tasks(options?: TasksPluginOptions) {
  return new TasksPlugin(options ?? {});
}

export * from './plugin';
export * from './task';
export * from './types';
export * from './driver';
export * from './driver-manager';
export * from './context';
