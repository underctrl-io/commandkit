import { DefaultLogger } from './DefaultLogger';
import { ILogger } from './ILogger';

export interface CommandKitLoggerOptions {
  /**
   * The logger provider to use.
   */
  provider: ILogger;
}

export interface LoggerImpl extends ILogger {
  configure(options: CommandKitLoggerOptions): void;
}

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
    impl[method] = (...args: any[]) => {
      opt.provider[method](...args);
    };
  }

  return impl;
}

export const Logger = createLogger({
  provider: new DefaultLogger(),
});
