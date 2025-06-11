import { getContext } from '../context/async-context';
import colors from '../utils/colors';
import { ILogger } from './ILogger';

/**
 * Log levels for the logger.
 */
enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  DEFAULT,
}

const execHandlerKind = {
  autocomplete: 'Autocomplete',
  messageContextMenu: 'MessageContextMenu',
  userContextMenu: 'UserContextMenu',
  chatInput: 'ChatInputCommand',
  message: 'Message',
};

const TextColorMap = {
  [LogLevel.DEBUG]: colors.blue,
  [LogLevel.INFO]: colors.green,
  [LogLevel.WARN]: colors.yellow,
  [LogLevel.ERROR]: colors.red,
  [LogLevel.DEFAULT]: colors.white,
};

const TextBgColorMap = {
  [LogLevel.DEBUG]: colors.bgBlue,
  [LogLevel.INFO]: colors.bgGreen,
  [LogLevel.WARN]: colors.bgYellow,
  [LogLevel.ERROR]: colors.bgRed,
  [LogLevel.DEFAULT]: colors.bgWhite,
};

const BoxChars = {
  vertical: '│',
  horizontalDown: '┬',
  horizontalUp: '┴',
  verticalRight: '├',
  corner: '└',
};

/**
 * Default logger implementation that logs messages to the console.
 * It formats the log messages with timestamps, log levels, and context information.
 */
export class DefaultLogger implements ILogger {
  private logger: Console;

  /**
   * Creates a new instance of DefaultLogger.
   * @param stdout The output stream for standard messages (default: process.stdout).
   * @param stderr The output stream for error messages (default: process.stderr).
   */
  public constructor(
    public stdout = process.stdout,
    public stderr = process.stderr,
  ) {
    this.logger = new console.Console(this.stdout, this.stderr);
  }

  private _formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const millis = date.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${millis}`;
  }

  private _getContext(): string {
    const ctx = getContext();
    if (!ctx) return '';

    const kind = ctx.variables.get('execHandlerKind');
    const commandHandler = ctx.variables.get('commandHandlerType');
    const command = ctx.variables.get('currentCommandName');
    if (!kind && !commandHandler) return '';

    const h = execHandlerKind[kind as keyof typeof execHandlerKind];

    if (!h && !commandHandler) return '';

    const forwardedBy = ctx.variables.get('forwardedBy');
    const forwardedTo = ctx.variables.get('forwardedTo');

    const cmdText = command ? colors.magenta(`/${command}`) + ' ' : '';
    const forward = forwardedTo
      ? `${colors.yellowBright(`(${forwardedBy || command} → ${forwardedTo})`)} `
      : '';

    return (
      colors.dim(`${BoxChars.vertical} `) +
      colors.cyanBright(
        `${cmdText}${forward}${h ? colors.gray(`[${h}]`) : ''}`.trim(),
      )
    );
  }

  private _getLevelLabel(level: LogLevel): string {
    let label: string;
    switch (level) {
      case LogLevel.DEBUG:
        label = '[DEBUG]';
        break;
      case LogLevel.INFO:
        label = '[INFO]';
        break;
      case LogLevel.WARN:
        label = '[WARN]';
        break;
      case LogLevel.ERROR:
        label = '[ERROR]';
        break;
      default:
        label = '[LOG]';
    }

    const coloredLabel = TextBgColorMap[level](
      colors.whiteBright(` ${label} `),
    );
    return `${coloredLabel}   `;
  }

  private _getPrefix(level: LogLevel): string {
    const timestamp = this._formatTime(new Date());
    const label = this._getLevelLabel(level);
    return `${label}${colors.dim(BoxChars.vertical)} ${colors.dim(timestamp)}`;
  }

  private _log(level: LogLevel, ...args: any[]): void {
    const prefix = this._getPrefix(level);
    const context = this._getContext();
    const colorFn = TextColorMap[level];

    if (context) {
      this.logger.log(
        `${prefix}\n${context} ${colors.dim(BoxChars.corner)}`,
        ...args.map((arg) => colorFn(arg)),
      );
    } else {
      this.logger.log(
        `${prefix} ${colors.dim(BoxChars.corner)}`,
        ...args.map((arg) => colorFn(arg)),
      );
    }
  }

  /**
   * Logs a debug message.
   * @param args The message arguments to log.
   */
  public debug(...args: any[]): void {
    this._log(LogLevel.DEBUG, ...args);
  }

  /**
   * Logs an error message.
   * @param args The message arguments to log.
   */
  public error(...args: any[]): void {
    this._log(LogLevel.ERROR, ...args);
  }

  /**
   * Logs a default message.
   * @param args The message arguments to log.
   */
  public log(...args: any[]): void {
    this._log(LogLevel.DEFAULT, ...args);
  }

  /**
   * Logs an info message.
   * @param args The message arguments to log.
   */
  public info(...args: any[]): void {
    this._log(LogLevel.INFO, ...args);
  }

  /**
   * Logs a warning message.
   * @param args The message arguments to log.
   */
  public warn(...args: any[]): void {
    this._log(LogLevel.WARN, ...args);
  }
}
