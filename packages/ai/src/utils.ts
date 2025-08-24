import { ApplicationCommandOptionType, TextBasedChannel } from 'discord.js';
import { AiConfig } from './plugin';
import { CommandData } from 'commandkit';
import z from 'zod';

/**
 * @private
 * @internal
 */
export async function createTypingIndicator(
  channel: TextBasedChannel,
): Promise<() => void> {
  let stopped = false;

  const runner = async () => {
    if (stopped) return clearInterval(typingInterval);

    if (channel.isSendable()) {
      await channel.sendTyping().catch(Object);
    }
  };

  const typingInterval = setInterval(runner, 3000).unref();

  await runner();

  return () => {
    stopped = true;
    clearInterval(typingInterval);
  };
}

/**
 * Generates AI config from a CommandKit command data.
 * @experimental
 */
export function experimental_createConfig(command: CommandData): AiConfig {
  const inputSchema = z.object({
    ...Object.fromEntries(
      command.options?.map((option) => [
        option.name,
        (() => {
          const { type, required, description } = option;

          const t = (() => {
            switch (type) {
              case ApplicationCommandOptionType.String:
                return z.string();
              case ApplicationCommandOptionType.Number:
                return z.number();
              case ApplicationCommandOptionType.Boolean:
                return z.boolean();
              case ApplicationCommandOptionType.Integer:
                return z.int();
              default:
                throw new Error(`Unsupported option type: ${type}`);
            }
          })().describe(description);

          if (!required) {
            return t.optional();
          }

          return t;
        })(),
      ]) ?? [],
    ),
  });

  return {
    description: command.description ?? `${command.name} command tool`,
    inputSchema,
  } satisfies AiConfig;
}
