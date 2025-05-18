import { TextDisplayBuilder, TextDisplayComponentData } from 'discord.js';

export type StringEncodable = string | number | boolean;

export interface TextDisplayProps
  extends Omit<TextDisplayComponentData, 'type' | 'content'> {
  children?: StringEncodable | StringEncodable[];
  content?: string;
}

export function TextDisplay(props: TextDisplayProps) {
  const textDisplay = new TextDisplayBuilder(props);

  if (!props.content && props.children) {
    if (Array.isArray(props.children)) {
      textDisplay.setContent(props.children.join(' '));
    } else {
      textDisplay.setContent(
        typeof props.children === 'string'
          ? props.children
          : String(props.children),
      );
    }
  }

  return textDisplay;
}
