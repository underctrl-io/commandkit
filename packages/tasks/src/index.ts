import {
  TaskPlugin,
  type TaskPluginOptions,
  configureTaskManager,
} from './plugin';
import * as drivers from './drivers';

export * from './augmentations';
export * from './TaskManager';
export * from './TaskContextManager';
export * from './driver';
export * from './plugin';
export { drivers };

/**
 * Create a tasks plugin instance
 * @param options Plugin options
 * @returns TaskPlugin instance
 */
export function tasks(options: TaskPluginOptions = {}) {
  return new TaskPlugin(options);
}

/**
 * BullMQ driver for task management
 * @param options BullMQ driver options
 * @returns BullMQ driver instance
 */
export const bullmq = drivers.bullmq;
