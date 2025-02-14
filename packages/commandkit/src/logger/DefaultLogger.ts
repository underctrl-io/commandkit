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

const commandHandlerType = {
  legacy: 'Legacy',
  app: 'App',
};

export class DefaultLogger implements ILogger {
  private logger: Console;

  public constructor(
    public stdout = process.stdout,
    public stderr = process.stderr,
  ) {
    this.logger = new console.Console(this.stdout, this.stderr);
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

    return `${colors.green(`${t}${command} ${h ? colors.gray(h) : ''}`.trim())}`;
  }

  private _getPrefix(level: LogLevel): string {
    const timestamp = new Date().toISOString();
    const ctx = this._getContext();

    switch (level) {
      case LogLevel.DEBUG:
        return `${colors.bgBlue(colors.black('[DEBUG]'))} | ${colors.gray(timestamp)} | ${ctx} - `;
      case LogLevel.INFO:
        return `${colors.bgGreen(colors.black('[INFO]'))} | ${colors.gray(timestamp)} | ${ctx} - `;
      case LogLevel.WARN:
        return `${colors.bgYellow(colors.black('[WARN]'))} | ${colors.gray(timestamp)} | ${ctx} - `;
      case LogLevel.ERROR:
        return `${colors.bgRed(colors.black('[ERROR]'))} | ${colors.gray(timestamp)} | ${ctx} - `;
      default:
        return `${colors.bgWhite(colors.black('[LOG]'))} | ${colors.gray(timestamp)} | ${ctx} - `;
    }
  }

  private _log(level: LogLevel, ...args: any[]): void {
    const prefix = this._getPrefix(level);
    this.logger.log(prefix, ...args);
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
