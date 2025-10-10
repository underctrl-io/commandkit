import { TextDisplayBuilder, TextDisplayComponentData } from 'discord.js';

/**
 * Represents a type that can be encoded as a string.
 */
export type StringEncodable = string | number | boolean;

/**
 * Represents the properties for a text display component.
 * This interface extends the TextDisplayComponentData type from discord.js,
 * excluding the 'type' and 'content' properties.
 */
export interface TextDisplayProps
  extends Omit<TextDisplayComponentData, 'type' | 'content'> {
  children?: StringEncodable | StringEncodable[];
  content?: string;
}

/**
 * The components v2 text display component
 * @param props The properties for the text display component.
 * @returns The text display builder instance.
 * @example ```tsx
 * import { TextDisplay } from 'commandkit';
 *
 * const textDisplay = <TextDisplay content="Hello, world!" />;
 * // or
 * const textDisplay = <TextDisplay>Some text content</TextDisplay>;
 * ```
 */
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
