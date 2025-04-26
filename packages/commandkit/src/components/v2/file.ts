import { FileBuilder, FileComponentData } from 'discord.js';

export interface FileProps extends Omit<FileComponentData, 'type' | 'file'> {
  url: string;
}

export function File(props: FileProps) {
  const file = new FileBuilder(props);

  if (props.url != null) {
    file.setURL(props.url);
  }

  return file;
}
