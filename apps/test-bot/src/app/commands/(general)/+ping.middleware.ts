import { Logger, type MiddlewareContext, stopMiddlewares } from 'commandkit';

export function beforeExecute(ctx: MiddlewareContext) {
  Logger.info(`Command-scoped middleware: ${ctx.commandName} will be stopped!`);
  Logger.info(
    'None of the other beforeExecute middlewares are supposed to be executed',
  );
  // stopMiddlewares();
}

export function afterExecute(ctx: MiddlewareContext) {
  Logger.info(
    `Command-scoped middleware: ${ctx.commandName} has been executed!`,
  );
}
