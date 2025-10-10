import { SeparatorBuilder, SeparatorComponentData } from 'discord.js';

/**
 * Represents the properties for a separator component.
 */
export interface SeparatorProps extends Omit<SeparatorComponentData, 'type'> {}

/**
 * The components v2 separator component
 * @param props The properties for the separator component.
 * @returns The separator builder instance.
 * @example ```tsx
 * import { Separator } from 'commandkit';
 *
 * const separator = <Separator />;
 * ```
 */
export function Separator(props: SeparatorProps) {
  const separator = new SeparatorBuilder(props);
  return separator;
}
