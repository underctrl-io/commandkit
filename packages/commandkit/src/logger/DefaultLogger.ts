import { getContext } from '../context/async-context';
import colors from '../utils/colors';
import { ILogger } from './ILogger';

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
  chatInput: 'SlashCommand',
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

export class DefaultLogger implements ILogger {
  private logger: Console;

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

    const t = commandHandler === 'app' ? '(app ✨) ' : '';
    const cmdText = command ? colors.magenta(`/${command}`) + ' ' : '';

    return (
      colors.dim(`${BoxChars.vertical} `) +
      colors.cyanBright(
        `${t}${cmdText}${h ? colors.gray(`[${h}]`) : ''}`.trim(),
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

  public debug(...args: any[]): void {
    this._log(LogLevel.DEBUG, ...args);
  }

  public error(...args: any[]): void {
    this._log(LogLevel.ERROR, ...args);
  }

  public log(...args: any[]): void {
    this._log(LogLevel.DEFAULT, ...args);
  }

  public info(...args: any[]): void {
    this._log(LogLevel.INFO, ...args);
  }

  public warn(...args: any[]): void {
    this._log(LogLevel.WARN, ...args);
  }
}
