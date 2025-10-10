import { FileBuilder, FileComponentData } from 'discord.js';

/**
 * Represents the properties for a file component.
 */
export interface FileProps extends Omit<FileComponentData, 'type' | 'file'> {
  url: string;
}

/**
 * The file component
 * @param props - The properties for the file component.
 * @returns The file builder instance.
 * @example ```tsx
 * import { File } from 'commandkit';
 *
 * const file = <File url="https://example.com/file.png" />;
 * ```
 */
export function File(props: FileProps) {
  const file = new FileBuilder(props);

  if (props.url != null) {
    file.setURL(props.url);
  }

  return file;
}
