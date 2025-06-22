/**
 * Async queue implementation for processing tasks sequentially or with limited concurrency.
 * Useful for rate-limiting, batching, or controlling resource usage.
 */

export interface AsyncQueueOptions {
  /** Maximum number of concurrent tasks. Default: 1 (sequential) */
  concurrency?: number;
  /** Optional callback invoked when all tasks are completed */
  onDrain?: () => void | Promise<void>;
  /** Optional AbortSignal for cancelling the queue */
  signal?: AbortSignal;
}

export type AsyncQueueTask<T> = () => Promise<T>;

export class AsyncQueue {
  private readonly concurrency: number;
  private readonly onDrain?: () => void | Promise<void>;
  private readonly signal?: AbortSignal;
  private running = 0;
  private paused = false;
  private aborted = false;
  private queue: Array<() => void> = [];

  constructor(options: AsyncQueueOptions = {}) {
    this.concurrency = options.concurrency ?? 1;
    this.onDrain = options.onDrain;
    this.signal = options.signal;

    if (this.signal) {
      this.signal.addEventListener('abort', () => {
        this.abort();
      });
    }
  }

  /**
   * Adds a task to the queue.
   * @param task - The async function to execute.
   * @param signal - Optional AbortSignal for cancelling this specific task.
   * @returns Promise resolving to the result of the task.
   */
  public add<T>(task: AsyncQueueTask<T>, signal?: AbortSignal): Promise<T> {
    if (this.aborted) {
      return Promise.reject(new Error('Queue has been aborted'));
    }

    return new Promise<T>((resolve, reject) => {
      const run = async () => {
        if (this.paused || this.aborted) {
          if (this.aborted) {
            reject(new Error('Queue has been aborted'));
          } else {
            this.queue.push(run);
          }
          return;
        }

        // Check if task-specific signal is aborted
        if (signal?.aborted) {
          reject(new Error('Task was aborted'));
          return;
        }

        this.running++;
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.running--;
          this.next();
        }
      };

      if (this.running < this.concurrency && !this.paused && !this.aborted) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }

  /**
   * Pauses the queue. No new tasks will be started until resumed.
   */
  public pause() {
    this.paused = true;
  }

  /**
   * Resumes the queue and processes pending tasks.
   */
  public resume() {
    if (!this.paused) return;
    this.paused = false;
    this.next();
  }

  /**
   * Aborts the queue, rejecting all pending tasks.
   */
  public abort() {
    this.aborted = true;
    this.clear();
  }

  /**
   * Clears all pending tasks from the queue.
   */
  public clear() {
    this.queue = [];
  }

  /**
   * Returns the number of running tasks.
   */
  public getRunning(): number {
    return this.running;
  }

  /**
   * Returns the number of pending tasks in the queue.
   */
  public getPending(): number {
    return this.queue.length;
  }

  /**
   * Returns true if the queue is currently paused.
   */
  public isPaused(): boolean {
    return this.paused;
  }

  /**
   * Returns true if the queue has been aborted.
   */
  public isAborted(): boolean {
    return this.aborted;
  }

  private next() {
    if (this.paused || this.aborted) return;
    while (this.running < this.concurrency && this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) fn();
    }
    if (this.running === 0 && this.queue.length === 0 && this.onDrain) {
      this.onDrain();
    }
  }
}

/**
 * Creates a new async queue instance with the specified configuration.
 * @param options - Configuration options for the async queue.
 * @returns New AsyncQueue instance.
 *
 * @example
 * ```typescript
 * const controller = new AbortController();
 * const queue = createAsyncQueue({
 *   concurrency: 2,
 *   signal: controller.signal
 * });
 * queue.add(async () => await doSomething());
 * controller.abort(); // Aborts the queue
 * ```
 */
export function createAsyncQueue(options?: AsyncQueueOptions): AsyncQueue {
  return new AsyncQueue(options);
}
