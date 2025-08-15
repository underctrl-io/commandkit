import { Logger, MiddlewareContext } from 'commandkit';

export function beforeExecute(ctx: MiddlewareContext) {
  Logger.info(
    `Command-scoped middleware: ${ctx.commandName} will be executed!`,
  );
}

export function afterExecute(ctx: MiddlewareContext) {
  Logger.info(
    `Command-scoped middleware: ${ctx.commandName} has been executed!`,
  );
}
