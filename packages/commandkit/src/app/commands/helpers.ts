import { Interaction, Message } from 'discord.js';

export type CommandSource = Interaction | Message;

export function isMessageSource(source: CommandSource): source is Message {
  return source instanceof Message;
}

export function isInteractionSource(
  source: CommandSource,
): source is Interaction {
  return !isMessageSource(source);
}
