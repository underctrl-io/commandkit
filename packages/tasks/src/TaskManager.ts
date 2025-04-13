import CommandKit from 'commandkit';
import { ITaskDriver } from './driver';
import { TaskContextManager } from './TaskContextManager';
import { injectContext } from './augmentations';

export class TaskManager {
  private driver: ITaskDriver | null = null;
  private context = new TaskContextManager(this);

  public constructor(public readonly commandkit: CommandKit) {
    injectContext(this.context);
  }

  public async destroy() {}

  public useDriver(driver: ITaskDriver) {
    this.driver = driver;
  }
}
