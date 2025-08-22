import { Logger, MiddlewareContext, stopMiddlewares } from 'commandkit';

export function beforeExecute(ctx: MiddlewareContext) {
  Logger.info(
    `Directory-scoped middleware: ${ctx.commandName} will be executed!`,
  );
  // stopMiddlewares();
}

export function afterExecute(ctx: MiddlewareContext) {
  Logger.info(
    `Directory-scoped middleware: ${ctx.commandName} has been executed!`,
  );
}
