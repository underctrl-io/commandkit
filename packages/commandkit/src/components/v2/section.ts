import {
  ButtonBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from 'discord.js';
import { applyId } from './common';

export interface SectionProps {
  children?: (ThumbnailBuilder | ButtonBuilder | TextDisplayBuilder)[];
  id?: number;
}

export function Section(props: SectionProps): SectionBuilder {
  const section = new SectionBuilder();

  applyId(props, section);

  if (props.children != null) {
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

export interface ThumbnailProps {
  id?: number;
  description?: string;
  spoiler?: boolean;
  url: string;
}

export function Thumbnail(props: ThumbnailProps) {
  const thumbnail = new ThumbnailBuilder({
    description: props.description,
    spoiler: props.spoiler,
    id: props.id,
    media: { url: props.url },
  });

  return thumbnail;
}
