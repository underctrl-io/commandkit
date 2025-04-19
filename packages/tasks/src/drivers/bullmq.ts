import { Queue, Worker, Job, QueueScheduler } from 'bullmq';
import { Client } from 'discord.js';
import CommandKit from 'commandkit';
import ms from 'ms';
import {
  CommandKitTask,
  CreateTaskOptions,
  ITaskDriver,
  TaskConfig,
  TaskContext,
  TaskExecutor,
  UpdateTaskOptions,
} from '../driver';
import { JSONEncodable } from '../TaskContextManager';
import { parseExpression } from 'cron-parser';

interface BullMQDriverOptions {
  redis: {
    host?: string;
    port?: number;
    password?: string;
    url?: string;
  };
  queue?: string;
}

interface TaskData {
  taskName: string;
  data: JSONEncodable;
}

export function bullmq(options: BullMQDriverOptions) {
  return new BullMQDriver(options);
}

class BullMQDriver implements ITaskDriver {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private scheduler: QueueScheduler | null = null;
  private client: Client | null = null;
  private commandkit: CommandKit | null = null;
  private executors: Map<string, TaskExecutor> = new Map();
  private queueName: string;
  private redisOptions: BullMQDriverOptions['redis'];

  constructor(options: BullMQDriverOptions) {
    this.queueName = options.queue || 'commandkit-tasks';
    this.redisOptions = options.redis;
  }

  async initialize(commandkit: CommandKit): Promise<void> {
    this.commandkit = commandkit;
    this.client = commandkit.client;

    // Create a queue scheduler to handle delayed jobs
    this.scheduler = new QueueScheduler(this.queueName, {
      connection: this.redisOptions,
    });

    // Create the queue
    this.queue = new Queue(this.queueName, {
      connection: this.redisOptions,
    });

    // Create a worker to process tasks
    // Only create one worker per process to ensure tasks run only once in a distributed environment
    this.worker = new Worker(
      this.queueName,
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        connection: this.redisOptions,
        concurrency: 5,
      },
    );

    // Listen for job completion events
    this.worker.on('completed', (job) => {
      console.log(`Task ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Task ${job?.id} failed:`, err);
    });
  }

  private async processJob(job: Job): Promise<void> {
    const { taskName, data } = job.data as TaskData;
    const executor = this.executors.get(taskName);

    if (!executor || !this.client || !this.commandkit) {
      throw new Error(
        `Task ${taskName} not found or initialization incomplete`,
      );
    }

    const context: TaskContext = {
      client: this.client,
      commandkit: this.commandkit,
      data: data || {},
      taskId: job.id || '',
      name: taskName,
    };

    // Execute the task
    await executor(context);
  }

  async registerStaticTask(
    name: string,
    executor: TaskExecutor,
    config: TaskConfig,
  ): Promise<void> {
    if (!this.queue || !this.client) {
      throw new Error('Driver not initialized');
    }

    // Store the executor function
    this.executors.set(name, executor);

    // Handle cron pattern scheduling
    if (config.pattern) {
      try {
        // Parse the cron pattern to validate it
        parseExpression(config.pattern);

        // Schedule a repeating job using the cron pattern
        await this.queue.add(
          name,
          { taskName: name, data: {} },
          {
            jobId: `cron:${name}`,
            repeat: {
              pattern: config.pattern,
            },
          },
        );
      } catch (error) {
        throw new Error(`Invalid cron pattern for task ${name}: ${error}`);
      }
    }
    // Handle 'every' scheduling
    else if (config.every) {
      try {
        // Convert the 'every' string to milliseconds
        const interval =
          typeof config.every === 'string' ? ms(config.every) : 0;

        if (!interval) {
          throw new Error(`Invalid interval: ${config.every}`);
        }

        // Schedule a repeating job
        await this.queue.add(
          name,
          { taskName: name, data: {} },
          {
            jobId: `interval:${name}`,
            repeat: {
              every: interval,
            },
          },
        );
      } catch (error) {
        throw new Error(`Invalid interval for task ${name}: ${error}`);
      }
    }
  }

  async createTask(
    options: CreateTaskOptions,
    executor: TaskExecutor,
  ): Promise<CommandKitTask> {
    if (!this.queue) {
      throw new Error('Driver not initialized');
    }

    // Store the executor function
    this.executors.set(options.name, executor);

    // Convert duration to milliseconds if it's a string
    let delay: number | undefined;
    if (options.duration) {
      if (typeof options.duration === 'string') {
        delay = ms(options.duration);
      } else if (options.duration instanceof Date) {
        delay = options.duration.getTime() - Date.now();
      } else {
        delay = options.duration;
      }
    }

    const jobId = options.id || `${options.name}:${Date.now()}`;

    // Add the task to the queue
    const job = await this.queue.add(
      options.name,
      { taskName: options.name, data: options.data || {} },
      {
        jobId,
        delay: delay && delay > 0 ? delay : undefined,
      },
    );

    return {
      id: job.id || '',
      name: options.name,
      data: options.data,
    };
  }

  async cancelTask(taskId: string): Promise<boolean> {
    if (!this.queue) {
      throw new Error('Driver not initialized');
    }

    try {
      // Get the job and remove it from the queue
      const job = await this.queue.getJob(taskId);
      if (job) {
        await job.remove();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to cancel task ${taskId}:`, error);
      return false;
    }
  }

  async invokeTask(taskId: string, data?: JSONEncodable): Promise<void> {
    if (!this.queue) {
      throw new Error('Driver not initialized');
    }

    try {
      // Get the job
      const job = await this.queue.getJob(taskId);
      if (!job) {
        throw new Error(`Task ${taskId} not found`);
      }

      // Create a new job data with updated data if provided
      const jobData = job.data as TaskData;
      const updatedData: TaskData = {
        taskName: jobData.taskName,
        data: data || jobData.data,
      };

      // Add a new job with the same ID but set to run immediately
      await this.queue.add(jobData.taskName, updatedData, {
        jobId: `invoke:${taskId}:${Date.now()}`,
      });
    } catch (error) {
      console.error(`Failed to invoke task ${taskId}:`, error);
      throw error;
    }
  }

  async updateTask(
    taskId: string,
    options: UpdateTaskOptions,
  ): Promise<CommandKitTask> {
    if (!this.queue) {
      throw new Error('Driver not initialized');
    }

    try {
      // Get the existing job
      const job = await this.queue.getJob(taskId);
      if (!job) {
        throw new Error(`Task ${taskId} not found`);
      }

      // Create updated task data
      const jobData = job.data as TaskData;
      const updatedData: TaskData = {
        taskName: jobData.taskName,
        data: options.data !== undefined ? options.data : jobData.data,
      };

      // Calculate new delay if duration is provided
      let delay: number | undefined;
      if (options.duration) {
        if (typeof options.duration === 'string') {
          delay = ms(options.duration);
        } else if (options.duration instanceof Date) {
          delay = options.duration.getTime() - Date.now();
        } else {
          delay = options.duration;
        }
      }

      // Remove the old job and create a new one with updated settings
      await job.remove();
      const newJob = await this.queue.add(jobData.taskName, updatedData, {
        jobId: taskId,
        delay: delay && delay > 0 ? delay : undefined,
      });

      return {
        id: newJob.id || '',
        name: jobData.taskName,
        data: updatedData.data,
      };
    } catch (error) {
      console.error(`Failed to update task ${taskId}:`, error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    // Clean up resources
    await this.worker?.close();
    await this.scheduler?.close();
    await this.queue?.close();
  }
}
