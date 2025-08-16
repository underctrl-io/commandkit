import { Logger, MiddlewareContext } from 'commandkit';

export function beforeExecute(ctx: MiddlewareContext) {
  Logger.info(`Global middleware: ${ctx.commandName} will be executed!`);
}

export function afterExecute(ctx: MiddlewareContext) {
  Logger.info(`Global middleware: ${ctx.commandName} has been executed!`);
}
