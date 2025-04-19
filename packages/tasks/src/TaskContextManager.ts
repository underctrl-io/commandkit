import { CommandKitTask, CreateTaskOptions, UpdateTaskOptions } from './driver';
import { TaskManager } from './TaskManager';

export type JSONEncodable =
  | string
  | number
  | boolean
  | null
  | JSONEncodable[]
  | { [key: string]: JSONEncodable };

export interface TaskDefinition {
  name: string;
  id?: string;
  data?: JSONEncodable;
  duration?: number | Date | string;
}

export class TaskContextManager {
  public constructor(private manager: TaskManager) {}

  /**
   * Create a new dynamic task
   * @param task Task definition
   * @returns The created task
   */
  public async create(task: TaskDefinition): Promise<CommandKitTask> {
    const driver = this.manager.getDriver();
    if (!driver) {
      throw new Error('Task driver not configured');
    }

    const executor = this.manager.getExecutor(task.name);
    if (!executor) {
      throw new Error(`Task '${task.name}' not found`);
    }

    const options: CreateTaskOptions = {
      name: task.name,
      id: task.id || `${task.name}:${Date.now()}`,
      data: task.data,
      duration: task.duration,
    };

    return driver.createTask(options, executor);
  }

  /**
   * Cancel a task by its ID
   * @param taskId The ID of the task to cancel
   * @returns Whether the task was successfully canceled
   */
  public async cancel(taskId: string): Promise<boolean> {
    const driver = this.manager.getDriver();
    if (!driver) {
      throw new Error('Task driver not configured');
    }

    return driver.cancelTask(taskId);
  }

  /**
   * Immediately invoke a task
   * @param taskId The ID of the task to invoke
   * @param data Optional data to pass to the task
   */
  public async invoke(taskId: string, data?: JSONEncodable): Promise<void> {
    const driver = this.manager.getDriver();
    if (!driver) {
      throw new Error('Task driver not configured');
    }

    await driver.invokeTask(taskId, data);
  }

  /**
   * Update an existing task
   * @param taskId The ID of the task to update
   * @param options Update options including data and/or duration
   * @returns The updated task
   */
  public async update(
    taskId: string,
    options: UpdateTaskOptions,
  ): Promise<CommandKitTask> {
    const driver = this.manager.getDriver();
    if (!driver) {
      throw new Error('Task driver not configured');
    }

    return driver.updateTask(taskId, options);
  }

  public async complete(task: string) {}

  public async fail(task: string) {}

  public async get(task: string) {}

  public async isPending(task: string) {}

  public async isDynamic(task: string) {}

  public async isStatic(task: string) {}
}
