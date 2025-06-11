import { AiContext } from './context';
import { Awaitable } from 'discord.js';
import { AiConfig } from './plugin';
import { Context } from 'commandkit';
import { getAiWorkerContext } from './ai-context-worker';

declare module 'commandkit' {
  interface CustomAppCommandProps {
    ai?: (ctx: AiContext) => Awaitable<unknown>;
    aiConfig?: AiConfig;
  }

  interface Context {
    ai?: AiContext;
  }
}

/**
 * @private
 * @internal
 */
export function augmentCommandKit(isAdd: boolean) {
  if (isAdd) {
    if (!Object.prototype.hasOwnProperty.call(Context.prototype, 'ai')) {
      Object.defineProperty(Context.prototype, 'ai', {
        get() {
          try {
            const { ctx } = getAiWorkerContext();
            return ctx;
          } catch {
            // no-op if not in AI worker context
          }
        },
      });
    }
  } else {
    if (Object.prototype.hasOwnProperty.call(Context.prototype, 'ai')) {
      delete Context.prototype.ai;
    }
  }
}
