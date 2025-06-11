/**
 * ILogger interface for logging functionality.
 */
export interface ILogger {
  /**
   * Logs a message with the default log level.
   * @param args The message to log.
   */
  log(...args: any[]): void;
  /**
   * Logs an error message.
   * @param args The error message to log.
   */
  error(...args: any[]): void;
  /**
   * Logs a warning message.
   * @param args The warning message to log.
   */
  warn(...args: any[]): void;
  /**
   * Logs an informational message.
   * @param args The informational message to log.
   */
  info(...args: any[]): void;
  /**
   * Logs a debug message.
   * @param args The debug message to log.
   */
  debug(...args: any[]): void;
}
