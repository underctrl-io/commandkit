import { TextDisplayBuilder, TextDisplayComponentData } from 'discord.js';

export interface TextDisplayProps
  extends Omit<TextDisplayComponentData, 'type' | 'content'> {
  children?: string | string[];
  content?: string;
}

export function TextDisplay(props: TextDisplayProps) {
  const textDisplay = new TextDisplayBuilder(props);

  if (!props.content && props.children) {
    if (Array.isArray(props.children)) {
      textDisplay.setContent(props.children.join(' '));
    } else {
      textDisplay.setContent(props.children);
    }
  }

  return textDisplay;
}
