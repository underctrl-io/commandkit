import { AsyncLocalStorage } from 'node:async_hooks';
import { CommandKitEnvironment } from './environment';
import { CommandKitErrorCodes, isCommandKitError } from '../utils/error-codes';
import { Interaction, MessageFlags } from 'discord.js';
import { CommandKit } from '../CommandKit';

const context = new AsyncLocalStorage<CommandKitEnvironment>();

export type GenericFunction<A extends any[] = any[]> = (...args: A) => any;

export function exitContext<T>(fn: () => T): T {
  return context.exit(fn);
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
    return context.run(env, async () => {
      try {
        // execute the target function
        const result = await fn(...args);

        return result;
      } catch (e) {
        // set the error in the environment data
        if (isCommandKitError(e)) {
          const code = Reflect.get(e, 'code');
          const interaction = env.variables.get('interaction') as Interaction;
          if (!interaction) return;

          switch (code) {
            case CommandKitErrorCodes.GuildOnlyException: {
              if (interaction.isRepliable()) {
                await interaction.reply({
                  content: 'This command is only available in guilds.',
                  flags: MessageFlags.Ephemeral,
                });
              }
              return;
            }
            case CommandKitErrorCodes.DMOnlyException: {
              if (interaction.isRepliable()) {
                await interaction.reply({
                  content: 'This command is only available in DMs.',
                  flags: MessageFlags.Ephemeral,
                });
              }
              return;
            }
          }

          return;
        }

        env.setExecutionError(e as Error);
      } finally {
        if (typeof finalizer === 'function') {
          // execute the finalizer function
          try {
            await finalizer(...args);
          } catch {
            // no-op
          }
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
export function getContext(): CommandKitEnvironment | void {
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

/**
 * Ensures the command is only available in guilds.
 * Note: do not wrap this function in a try/catch block.
 */
export function guildOnly() {
  const env = useEnvironment();
  const interaction: Interaction = env.variables.get('interaction');

  if (!interaction) {
    throw new Error('No interaction found in environment.');
  }

  if (!interaction.guild) {
    const error = new Error('This command is only available in guilds.');
    Reflect.set(error, 'code', CommandKitErrorCodes.GuildOnlyException);

    throw error;
  }
}

/**
 * Ensures the command is only available in DMs.
 * Note: do not wrap this function in a try/catch block.
 */
export function dmOnly() {
  const env = useEnvironment();
  const interaction: Interaction = env.variables.get('interaction');

  if (!interaction) {
    throw new Error('No interaction found in environment.');
  }

  if (interaction.guild) {
    const error = new Error('This command is only available in DMs.');
    Reflect.set(error, 'code', CommandKitErrorCodes.DMOnlyException);

    throw error;
  }
}
