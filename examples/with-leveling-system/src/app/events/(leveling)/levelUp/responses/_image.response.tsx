import { locale } from '@commandkit/i18n';
import {
  Container,
  MediaGallery,
  MediaGalleryItem,
  TextDisplay,
} from 'commandkit';
import { AttachmentBuilder, Colors, Message, MessageFlags } from 'discord.js';
import { randomInt } from 'node:crypto';

export async function imageResponse(message: Message, newLevel: number) {
  const { t } = locale(message.guild!.preferredLocale);
  const colors = Object.values(Colors);
  const randomColor = colors[randomInt(colors.length)];
  const levelUpImage = new AttachmentBuilder('./assets/level-up.png')
    .setName('level-up.png')
    .setDescription('Level up image');

  const container = (
    <Container accentColor={randomColor}>
      <TextDisplay>
        {t('level_up', {
          user: message.author.toString(),
          level: newLevel.toLocaleString(),
        })}
      </TextDisplay>
      <MediaGallery>
        <MediaGalleryItem
          url={`attachment://${levelUpImage.name}`}
          description={levelUpImage.description!}
        />
      </MediaGallery>
    </Container>
  );

  await message
    .reply({
      components: [container],
      files: [levelUpImage],
      flags: MessageFlags.IsComponentsV2,
    })
    .catch(console.error);
}
