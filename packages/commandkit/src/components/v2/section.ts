// import { TextDisplayBuilder, TextDisplayComponentData } from 'discord.js';

import {
  ButtonBuilder,
  ComponentBuilder,
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
