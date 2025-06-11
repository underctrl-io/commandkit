import { MediaGalleryBuilder, MediaGalleryItemBuilder } from 'discord.js';
import { applyId } from './common';

/**
 * Represents the properties for a media gallery component.
 */
export interface MediaGalleryProps {
  id?: number;
  children?: MediaGalleryItemBuilder[];
}

/**
 * The media gallery component
 * @param props The properties for the media gallery component.
 * @returns The media gallery builder instance.
 * @example ```tsx
 * import { MediaGallery } from 'commandkit';
 *
 * const gallery = (
 *   <MediaGallery>
 *     <MediaGalleryItem url="https://example.com/image1.png" description="Image 1" />
 *     <MediaGalleryItem url="https://example.com/image2.png" description="Image 2" />
 *   </MediaGallery>
 * );
 * ```
 */
export function MediaGallery(props: MediaGalleryProps) {
  const gallery = new MediaGalleryBuilder();

  applyId(props, gallery);

  if (props.children != null) {
    if (!Array.isArray(props.children)) props.children = [props.children];
    gallery.addItems(props.children.flat());
  }

  return gallery;
}

/**
 * Represents the properties for a media gallery item component.
 */
export interface MediaGalleryItemProps {
  description?: string;
  spoiler?: boolean;
  url?: string;
}

/**
 * The media gallery item component
 * @param props The properties for the media gallery item component.
 * @returns The media gallery item builder instance.
 * @example ```tsx
 * import { MediaGalleryItem } from 'commandkit';
 *
 * const item = <MediaGalleryItem url="https://example.com/image.png" description="An image" />;
 * ```
 */
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
