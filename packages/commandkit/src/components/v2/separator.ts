import { SeparatorBuilder, SeparatorComponentData } from 'discord.js';

export interface SeparatorProps extends Omit<SeparatorComponentData, 'type'> {}

export function Separator(props: SeparatorProps) {
  const separator = new SeparatorBuilder(props);
  return separator;
}
