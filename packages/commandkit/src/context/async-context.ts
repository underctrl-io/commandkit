import { AsyncLocalStorage } from 'node:async_hooks';
import { CommandKitEnvironment } from './environment';
import { CommandKit } from '../CommandKit';
import { isCommandKitError } from '../utils/error-codes';

const context = new AsyncLocalStorage<CommandKitEnvironment>();

export type GenericFunction<A extends any[] = any[]> = (...args: A) => any;

export function exitContext<T>(fn: () => T): T {
  return context.exit(fn);
}

export function provideContext<R>(
  value: CommandKitEnvironment,
  receiver: () => R,
): R {
  return context.run(value, receiver);
}

/**
 * Returns a context-aware version of the given function.
 * @param env - The commandkit environment data.
 * @param fn - The target function.
 * @param finalizer - An optional finalizer function to run after the target function. This function will be context-aware.
 * @internal
 */
export function makeContextAwareFunction<
  R extends GenericFunction,
  F extends GenericFunction,
>(env: CommandKitEnvironment, fn: R, finalizer?: F): R {
  const _fn = (...args: any[]) => {
    return provideContext(env, async () => {
      try {
        // execute the target function
        const result = await fn(...args);

        return result;
      } catch (e) {
        if (!isCommandKitError(e)) {
          env.setExecutionError(e as Error);
        }
      } finally {
        if (typeof finalizer === 'function') {
          // execute the finalizer function
          setImmediate(async () => {
            try {
              await finalizer(...args);
            } catch {
              // no-op
            }
          });
        }
      }
    });
  };

  return _fn as R;
}

/**
 * Retrieves commandkit
 * @private
 * @internal
 */
export function getCommandKit(): CommandKit | undefined;
export function getCommandKit(strict: true): CommandKit;
export function getCommandKit(strict: false): CommandKit | undefined;
export function getCommandKit(strict = false): CommandKit | undefined {
  const kit = context.getStore()?.commandkit ?? CommandKit.instance;

  if (!kit && strict) {
    throw new Error('CommandKit instance not found.');
  }

  return kit;
}

/**
 * Get the current commandkit context.
 * @internal
 */
export function getContext(): CommandKitEnvironment | undefined {
  const ctx = context.getStore();
  return ctx;
}

/**
 * Use current commandkit context. Throws an error if no context is found.
 */
export function useEnvironment(): CommandKitEnvironment {
  const ctx = context.getStore();
  if (!ctx) {
    throw new Error(
      'No commandkit environment found. Please make sure you are inside commandkit handler.',
    );
  }

  return ctx;
}
