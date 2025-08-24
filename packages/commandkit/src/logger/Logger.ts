import { DefaultLogger } from './DefaultLogger';
import type { ILogger } from './ILogger';

/**
 * Options for configuring the CommandKit logger.
 */
export interface CommandKitLoggerOptions {
  /**
   * The logger provider to use.
   */
  provider: ILogger;
}

/**
 * Logger implementation for CommandKit.
 */
export interface LoggerImpl extends ILogger {
  /**
   * Configures the logger with the specified options.
   * @param options The logger options to apply.
   */
  configure(options: CommandKitLoggerOptions): void;
}

/**
 * Creates a new logger instance with the specified options.
 * @param options The options for configuring the logger.
 * @returns A new logger instance.
 */
export function createLogger(options: CommandKitLoggerOptions): LoggerImpl {
  let opt = options;

  if (!opt?.provider) {
    throw new Error('A logger provider must be provided.');
  }

  const methods = ['log', 'error', 'warn', 'info', 'debug'] as const;

  const impl = {
    configure(options) {
      opt = options;
    },
  } as LoggerImpl;

  for (const method of methods) {
    impl[method] = (...message: any) => {
      // @ts-ignore
      opt.provider[method](...message);
    };
  }

  return impl;
}

/**
 * Default logger instance for CommandKit. This logger uses the DefaultLogger as its provider.
 * The provider can be replaced with a custom logger implementation using the `configure` method.
 */
export const Logger = createLogger({
  provider: new DefaultLogger(),
});
