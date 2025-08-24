/**
 * ILogger interface for logging functionality.
 */
export interface ILogger {
  /**
   * Logs a message with the default log level.
   * @param message The message to log.
   */
  log(message: any): void;
  /**
   * Logs a message with the default log level using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  log(strings: TemplateStringsArray, ...values: any[]): void;
  /**
   * Logs an error message.
   * @param message The error message to log.
   */
  error(message: any): void;
  /**
   * Logs an error message using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  error(strings: TemplateStringsArray, ...values: any[]): void;
  /**
   * Logs a warning message.
   * @param message The warning message to log.
   */
  warn(message: any): void;
  /**
   * Logs a warning message using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  warn(strings: TemplateStringsArray, ...values: any[]): void;
  /**
   * Logs an informational message.
   * @param message The informational message to log.
   */
  info(message: any): void;
  /**
   * Logs an informational message using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  info(strings: TemplateStringsArray, ...values: any[]): void;
  /**
   * Logs a debug message.
   * @param message The debug message to log.
   */
  debug(message: any): void;
  /**
   * Logs a debug message using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  debug(strings: TemplateStringsArray, ...values: any[]): void;
}
