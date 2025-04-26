import CommandKit, {
  ChatInputCommand,
  CommandData,
  MediaGallery,
  MediaGalleryItem,
  TextDisplay,
} from 'commandkit';
import { MessageFlags } from 'discord.js';

export const command: CommandData = {
  name: 'gallery',
  description: 'Test components v2 gallery',
};

const mediaItems: string[] = Array.from(
  {
    length: 6,
  },
  (_, i) => `https://cdn.discordapp.com/embed/avatars/${i}.png`,
);

export const chatInput: ChatInputCommand = async (ctx) => {
  const components = (
    <>
      <TextDisplay content="Discord avatars" />
      <MediaGallery>
        {mediaItems.map((item) => (
          <MediaGalleryItem description="Gallery item description" url={item} />
        ))}
      </MediaGallery>
    </>
  );

  await ctx.interaction.reply({
    components,
    flags: MessageFlags.IsComponentsV2,
  });
};
