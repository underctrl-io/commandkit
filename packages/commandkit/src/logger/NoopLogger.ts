import { ILogger } from './ILogger';

/**
 * Noop logger implementation that does nothing.
 */
export class NoopLogger implements ILogger {
  /**
   * Logs a debug message.
   * @param message The message to log.
   */
  public debug(message: any): void;
  /**
   * Logs a debug message using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  public debug(strings: TemplateStringsArray, ...values: any[]): void;
  public debug(
    messageOrStrings: any | TemplateStringsArray,
    ...values: any[]
  ): void {}

  /**
   * Logs an error message.
   * @param message The error message to log.
   */
  public error(message: any): void;
  /**
   * Logs an error message using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  public error(strings: TemplateStringsArray, ...values: any[]): void;
  public error(
    messageOrStrings: any | TemplateStringsArray,
    ...values: any[]
  ): void {}

  /**
   * Logs a default message.
   * @param message The message to log.
   */
  public log(message: any): void;
  /**
   * Logs a default message using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  public log(strings: TemplateStringsArray, ...values: any[]): void;
  public log(
    messageOrStrings: any | TemplateStringsArray,
    ...values: any[]
  ): void {}

  /**
   * Logs an info message.
   * @param message The informational message to log.
   */
  public info(message: any): void;
  /**
   * Logs an info message using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  public info(strings: TemplateStringsArray, ...values: any[]): void;
  public info(
    messageOrStrings: any | TemplateStringsArray,
    ...values: any[]
  ): void {}

  /**
   * Logs a warning message.
   * @param message The warning message to log.
   */
  public warn(message: any): void;
  /**
   * Logs a warning message using template literals.
   * @param strings The template literal strings.
   * @param values The values to interpolate.
   */
  public warn(strings: TemplateStringsArray, ...values: any[]): void;
  public warn(
    messageOrStrings: any | TemplateStringsArray,
    ...values: any[]
  ): void {}
}
