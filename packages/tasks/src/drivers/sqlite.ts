import { TaskDriver, TaskRunner } from '../driver';
import { TaskData } from '../types';
import { DatabaseSync } from 'node:sqlite';
import cronParser from 'cron-parser';

/**
 * SQLite-based persistent job queue manager for CommandKit tasks.
 *
 * - Jobs are recoverable on restart (pending jobs from the past are run on startup)
 * - Job data is persisted in SQLite
 * - Supports both cron and date-based schedules (uses cron-parser for cron)
 *
 * @example
 * import { SQLiteDriver } from '@commandkit/tasks/sqlite';
 * import { setDriver } from '@commandkit/tasks';
 *
 * const driver = new SQLiteDriver('./tasks.db');
 * setDriver(driver);
 */
export class SQLiteDriver implements TaskDriver {
  private runner: TaskRunner | null = null;
  private db: DatabaseSync;
  private interval: NodeJS.Timeout | null = null;

  /**
   * Create a new SQLiteDriver instance.
   * @param dbPath Path to the SQLite database file (default: './commandkit-tasks.db'). Use `:memory:` for an in-memory database.
   */
  constructor(dbPath = './commandkit-tasks.db') {
    this.db = new DatabaseSync(dbPath, { open: true });
    this.init();
  }

  /**
   * Destroy the SQLite driver and stop the polling loop.
   */
  public destroy() {
    this.db.close();
    this.interval && clearInterval(this.interval);
  }

  /**
   * Initialize the jobs table and start the polling loop.
   */
  private init() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      data TEXT,
      schedule_type TEXT NOT NULL,
      schedule_value TEXT NOT NULL,
      timezone TEXT,
      next_run INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      last_run INTEGER
    )`);
    this.startPolling();
  }

  /**
   * Schedule a new job.
   * @param task TaskData to schedule
   * @returns The job ID as a string
   */
  async create(task: TaskData): Promise<string> {
    const { name, data, schedule, timezone } = task;
    let nextRun: number;
    let scheduleType: string;
    let scheduleValue: string;

    if (typeof schedule === 'string') {
      scheduleType = 'cron';
      scheduleValue = schedule;
      const interval = cronParser.parseExpression(schedule, {
        tz: timezone,
      });
      nextRun = interval.next().getTime();
    } else {
      scheduleType = 'date';
      scheduleValue = String(schedule);
      nextRun = typeof schedule === 'number' ? schedule : schedule.getTime();
    }

    const stmt = this.db.prepare(
      `INSERT INTO jobs (name, data, schedule_type, schedule_value, timezone, next_run, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    );
    const result = stmt.run(
      name,
      JSON.stringify(data ?? {}),
      scheduleType,
      scheduleValue,
      timezone ?? null,
      nextRun,
      Date.now(),
    );

    if (task.immediate) {
      await this.runner?.({
        name,
        data,
        timestamp: Date.now(),
      });
    }

    return result.lastInsertRowid.toString();
  }

  /**
   * Delete a scheduled job by its ID.
   * @param identifier Job ID
   */
  async delete(identifier: string): Promise<void> {
    const stmt = this.db.prepare(`DELETE FROM jobs WHERE id = ?`);
    stmt.run(identifier);
  }

  /**
   * Set the task runner function to be called when a job is due.
   * @param runner TaskRunner function
   */
  async setTaskRunner(runner: TaskRunner): Promise<void> {
    this.runner = runner;
  }

  /**
   * Poll the database for due jobs and execute them.
   * Handles recovery of missed jobs on restart.
   */
  private startPolling() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.pollJobs(), 1000);
    // Run immediately on startup
    this.pollJobs();
  }

  /**
   * Poll for jobs that are due and execute them.
   */
  private pollJobs() {
    if (!this.runner) return;
    const now = Date.now();
    const stmt = this.db.prepare(
      `SELECT * FROM jobs WHERE status = 'pending' AND next_run <= ?`,
    );
    const rows = stmt.all(now) as Array<{
      id: number;
      name: string;
      data: string;
      schedule_type: string;
      schedule_value: string;
      timezone: string | null;
      next_run: number;
      status: string;
      created_at: number;
      last_run: number | null;
    }>;

    for (const job of rows) {
      this.executeJob(job);
    }
  }

  /**
   * Execute a job and reschedule or remove as needed.
   */
  private async executeJob(job: {
    id: number;
    name: string;
    data: string;
    schedule_type: string;
    schedule_value: string;
    timezone: string | null;
    next_run: number;
    status: string;
    created_at: number;
    last_run: number | null;
  }) {
    if (!this.runner) return;
    const data = JSON.parse(job.data ?? '{}');
    await this.runner({
      name: job.name,
      data,
      timestamp: Date.now(),
    });
    const now = Date.now();
    if (job.schedule_type === 'cron') {
      let nextRun: number | null = null;
      try {
        const interval = cronParser.parseExpression(job.schedule_value, {
          tz: job.timezone || undefined,
        });
        // Find the next run after now
        while (true) {
          const candidate = interval.next().getTime();
          if (candidate > now) {
            nextRun = candidate;
            break;
          }
        }
      } catch {
        nextRun = null;
      }
      if (nextRun) {
        const stmt = this.db.prepare(
          `UPDATE jobs SET next_run = ?, last_run = ? WHERE id = ?`,
        );
        stmt.run(nextRun, now, job.id);
      } else {
        const stmt = this.db.prepare(
          `UPDATE jobs SET status = 'completed', last_run = ? WHERE id = ?`,
        );
        stmt.run(now, job.id);
      }
    } else {
      const stmt = this.db.prepare(
        `UPDATE jobs SET status = 'completed', last_run = ? WHERE id = ?`,
      );
      stmt.run(now, job.id);
    }
  }
}
