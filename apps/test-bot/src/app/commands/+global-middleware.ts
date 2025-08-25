import { Logger, MiddlewareContext, stopMiddlewares } from 'commandkit';

export function beforeExecute(ctx: MiddlewareContext) {
  Logger.info(`Global middleware: ${ctx.commandName} will be executed!`);
  // ctx.message.reply('Global middleware: This command will not be executed!');
  // stopMiddlewares();
}

export function afterExecute(ctx: MiddlewareContext) {
  Logger.info(`Global middleware: ${ctx.commandName} has been executed!`);
}
