import { MediaGalleryBuilder, MediaGalleryItemBuilder } from 'discord.js';
import { applyId } from './common';

export interface MediaGalleryProps {
  id?: number;
  children?: MediaGalleryItemBuilder[];
}

export function MediaGallery(props: MediaGalleryProps) {
  const gallery = new MediaGalleryBuilder();

  applyId(props, gallery);

  if (props.children != null) {
    gallery.addItems(props.children.flat());
  }

  return gallery;
}

export interface MediaGalleryItemProps {
  description?: string;
  spoiler?: boolean;
  url?: string;
}

export function MediaGalleryItem(props: MediaGalleryItemProps) {
  const item = new MediaGalleryItemBuilder();

  if (props.description != null) {
    item.setDescription(props.description);
  }

  if (props.spoiler != null) {
    item.setSpoiler(props.spoiler);
  }

  if (props.url != null) {
    item.setURL(props.url);
  }

  return item;
}
