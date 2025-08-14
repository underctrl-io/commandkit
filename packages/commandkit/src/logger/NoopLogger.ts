import { ILogger } from './ILogger';

/**
 * Noop logger implementation that does nothing.
 */
export class NoopLogger implements ILogger {
  /**
   * Logs a debug message.
   * @param args The message arguments to log.
   */
  public debug(...args: any[]): void {}

  /**
   * Logs an error message.
   * @param args The message arguments to log.
   */
  public error(...args: any[]): void {}

  /**
   * Logs a default message.
   * @param args The message arguments to log.
   */
  public log(...args: any[]): void {}

  /**
   * Logs an info message.
   * @param args The message arguments to log.
   */
  public info(...args: any[]): void {}

  /**
   * Logs a warning message.
   * @param args The message arguments to log.
   */
  public warn(...args: any[]): void {}
}
