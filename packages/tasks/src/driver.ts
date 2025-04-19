import { Client } from 'discord.js';
import CommandKit from 'commandkit';
import { JSONEncodable } from './TaskContextManager';

export interface CommandKitTask {
  id: string;
  name: string;
  data?: JSONEncodable;
}

export interface TaskContext<T extends JSONEncodable = any> {
  client: Client;
  commandkit: CommandKit;
  data: T;
  taskId: string;
  name: string;
}

export interface TaskConfig {
  name?: string;
  pattern?: string;
  every?: string;
}

export type TaskExecutor<T extends JSONEncodable = any> = (
  ctx: TaskContext<T>,
) => Promise<void> | void;

export interface CreateTaskOptions {
  name: string;
  id?: string;
  data?: JSONEncodable;
  duration?: string | number | Date;
}

export interface UpdateTaskOptions {
  data?: JSONEncodable;
  duration?: string | number | Date;
}

export interface ITaskDriver {
  // Initialize the driver
  initialize(commandkit: CommandKit): Promise<void>;

  // Register a static task with cron pattern
  registerStaticTask(
    name: string,
    executor: TaskExecutor,
    config: TaskConfig,
  ): Promise<void>;

  // Create a dynamic task
  createTask(
    options: CreateTaskOptions,
    executor: TaskExecutor,
  ): Promise<CommandKitTask>;

  // Cancel a task
  cancelTask(taskId: string): Promise<boolean>;

  // Execute a task immediately
  invokeTask(taskId: string, data?: JSONEncodable): Promise<void>;

  // Update an existing task
  updateTask(
    taskId: string,
    options: UpdateTaskOptions,
  ): Promise<CommandKitTask>;

  // Clean up resources
  destroy(): Promise<void>;
}
