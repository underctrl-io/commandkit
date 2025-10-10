import {
  ButtonBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from 'discord.js';
import { applyId } from './common';

/**
 * Represents the properties for a section component.
 */
export interface SectionProps {
  children?: (ThumbnailBuilder | ButtonBuilder | TextDisplayBuilder)[];
  id?: number;
}

/**
 * The components v2 section component
 * @param props The properties for the section component.
 * @returns The section builder instance.
 * @example ```tsx
 * import { Section } from 'commandkit';
 *
 * const section = <Section>...</Section>;
 * ```
 */
export function Section(props: SectionProps): SectionBuilder {
  const section = new SectionBuilder();

  applyId(props, section);

  if (props.children != null) {
    if (!Array.isArray(props.children)) props.children = [props.children];
    for (const accessory of props.children.flat()) {
      if (accessory instanceof ThumbnailBuilder) {
        section.setThumbnailAccessory(accessory);
      } else if (accessory instanceof ButtonBuilder) {
        section.setButtonAccessory(accessory);
      } else if (accessory instanceof TextDisplayBuilder) {
        section.addTextDisplayComponents(accessory);
      }
    }
  }

  return section;
}

/**
 * Represents the properties for a thumbnail component.
 */
export interface ThumbnailProps {
  id?: number;
  description?: string;
  spoiler?: boolean;
  url: string;
}

/**
 * The thumbnail component
 * @param props The properties for the thumbnail component.
 * @returns The thumbnail builder instance.
 * @example ```tsx
 * import { Thumbnail } from 'commandkit';
 *
 * const thumbnail = <Thumbnail url="https://example.com/image.png" description="An image" />;
 * ```
 */
export function Thumbnail(props: ThumbnailProps) {
  const thumbnail = new ThumbnailBuilder({
    description: props.description,
    spoiler: props.spoiler,
    id: props.id,
    media: { url: props.url },
  });

  return thumbnail;
}
