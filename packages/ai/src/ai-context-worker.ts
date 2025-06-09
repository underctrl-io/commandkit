import { Message } from 'discord.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AiContext } from './context';

const worker = new AsyncLocalStorage<{ message: Message; ctx: AiContext }>();

export function getAiWorkerContext(): { message: Message; ctx: AiContext } {
  const ctx = worker.getStore();

  if (!ctx) {
    throw new Error(
      'AI context is not available. Ensure you are using AI in a CommandKit environment.',
    );
  }

  return ctx;
}

export function runInAiWorkerContext<R, F extends (...args: any[]) => R>(
  ctx: AiContext,
  message: Message,
  callback: F,
): R {
  return worker.run({ message, ctx }, callback);
}
