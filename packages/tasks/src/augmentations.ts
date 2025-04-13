import { Context as NativeContext } from 'commandkit';
import { TaskContextManager } from './TaskContextManager';

declare module 'commandkit' {
  interface Context {
    tasks: TaskContextManager;
  }
}

export function injectContext(ctx: TaskContextManager) {
  NativeContext.prototype.tasks = ctx;
}
