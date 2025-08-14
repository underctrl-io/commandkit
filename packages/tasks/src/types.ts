import { TaskContext } from './context';

/**
 * Represents a task schedule configuration.
 *
 * Tasks can be scheduled using either cron expressions or specific dates/timestamps.
 * The timezone is optional and defaults to the system timezone.
 */
export type TaskSchedule = string | Date | number;

/**
 * Defines a task with its execution logic and scheduling.
 *
 * Tasks can have optional preparation logic that determines whether the task should run,
 * and required execution logic that performs the actual task work.
 */
export interface TaskDefinition<
  T extends Record<string, any> = Record<string, any>,
> {
  /** Unique identifier for the task */
  name: string;
  /** Optional schedule configuration for recurring or delayed execution */
  schedule?: TaskSchedule;
  /** Optional timezone for the schedule */
  timezone?: string;
  /** Whether the task should run immediately when created (only for cron tasks) */
  immediate?: boolean;
  /**
   * Optional preparation function that determines if the task should execute.
   * Return false to skip execution for this run.
   */
  prepare?: (ctx: TaskContext<T>) => Promise<boolean>;
  /**
   * The main execution function that performs the task work.
   * This is called when the task is scheduled to run.
   */
  execute: (ctx: TaskContext<T>) => Promise<void>;
}

/**
 * Represents the data structure for a task instance.
 *
 * This includes the task metadata and any custom data passed to the task.
 */
export interface TaskData<T extends Record<string, any> = Record<string, any>> {
  /** The name of the task definition to execute */
  name: string;
  /** Custom data passed to the task execution context */
  data: T;
  /** Schedule configuration for when the task should run */
  schedule: TaskSchedule;
  /** Optional timezone for the schedule */
  timezone?: string;
  /** Whether the task should run immediately when created */
  immediate?: boolean;
}

/**
 * Partial task data for creating tasks with optional fields.
 *
 * Useful when you want to create a task with only some fields specified.
 */
export type PartialTaskData<
  T extends Record<string, any> = Record<string, any>,
> = Partial<TaskData<T>>;

/**
 * Data structure passed to task execution handlers.
 *
 * This includes the task metadata and execution timestamp, but excludes
 * scheduling information since the task is already being executed.
 */
export type TaskExecutionData = Omit<
  TaskData,
  'schedule' | 'immediate' | 'timezone'
> & {
  /** Unix timestamp when the task execution started */
  timestamp: number;
};
