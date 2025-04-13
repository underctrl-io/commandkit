import { TaskPlugin, type TaskPluginOptions } from './plugin';

export * from './augmentations';
export * from './TaskManager';
export * from './TaskContextManager';
export * from './driver';
export * from './plugin';

export function tasks(options: TaskPluginOptions = {}) {
  return new TaskPlugin(options);
}
