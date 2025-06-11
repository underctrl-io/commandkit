import { TextBasedChannel } from 'discord.js';

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
