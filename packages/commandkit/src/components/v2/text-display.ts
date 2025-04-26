import { TextDisplayBuilder, TextDisplayComponentData } from 'discord.js';

export interface TextDisplayProps
  extends Omit<TextDisplayComponentData, 'type'> {}

export function TextDisplay(props: TextDisplayProps) {
  const textDisplay = new TextDisplayBuilder(props);
  return textDisplay;
}
