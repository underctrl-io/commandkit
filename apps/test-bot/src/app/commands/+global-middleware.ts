import { Logger, MiddlewareContext } from 'commandkit';

export function beforeExecute(ctx: MiddlewareContext) {
  Logger.info(`${ctx.commandName} will be executed!`);
}

export function afterExecute(ctx: MiddlewareContext) {
  Logger.info(`${ctx.commandName} has been executed!`);
}
