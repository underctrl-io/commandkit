import {
  ActionRowBuilder,
  ComponentBuilder,
  ContainerBuilder,
  ContainerComponentData,
  FileBuilder,
  MediaGalleryBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';
import { applyId } from './common';

export interface ContainerProps
  extends Omit<ContainerComponentData, 'type' | 'components'> {
  children?: ComponentBuilder[];
}

export function Container(props: ContainerProps): ContainerBuilder {
  const container = new ContainerBuilder();

  applyId(props, container);

  if (typeof props.accentColor != null) {
    container.setAccentColor(props.accentColor);
  }

  if (props.spoiler != null) {
    container.setSpoiler(props.spoiler);
  }

  if (props.children != null) {
    if (!Array.isArray(props.children)) props.children = [props.children];
    if (props.children.length === 0) return container;

    for (const child of props.children.flat()) {
      if (child instanceof TextDisplayBuilder) {
        container.addTextDisplayComponents(child);
      }

      if (child instanceof FileBuilder) {
        container.addFileComponents(child);
      }

      if (child instanceof ActionRowBuilder) {
        container.addActionRowComponents(child);
      }

      if (child instanceof SeparatorBuilder) {
        container.addSeparatorComponents(child);
      }

      if (child instanceof SectionBuilder) {
        container.addSectionComponents(child);
      }

      if (child instanceof MediaGalleryBuilder) {
        container.addMediaGalleryComponents(child);
      }
    }
  }

  return container;
}
