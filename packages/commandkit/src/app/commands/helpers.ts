import { Interaction, Message } from 'discord.js';

/**
 * Union type representing possible command sources.
 */
export type CommandSource = Interaction | Message;

/**
 * Type guard to check if a command source is a Discord message.
 * @param source - The command source to check
 * @returns True if the source is a Message
 */
export function isMessageSource(source: CommandSource): source is Message {
  return source instanceof Message;
}

/**
 * Type guard to check if a command source is a Discord interaction.
 * @param source - The command source to check
 * @returns True if the source is an Interaction
 */
export function isInteractionSource(
  source: CommandSource,
): source is Interaction {
  return !isMessageSource(source);
}
