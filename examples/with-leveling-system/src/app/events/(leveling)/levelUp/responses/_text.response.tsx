import { locale } from '@commandkit/i18n';
import { Container, TextDisplay } from 'commandkit';
import { Colors, Message, MessageFlags } from 'discord.js';
import { randomInt } from 'node:crypto';

export async function plainResponse(message: Message, newLevel: number) {
  const { t } = locale(message.guild!.preferredLocale);
  const colors = Object.values(Colors);
  const randomColor = colors[randomInt(colors.length)];

  const container = (
    <Container accentColor={randomColor}>
      <TextDisplay>
        {t('level_up', {
          user: message.author.toString(),
          level: newLevel.toLocaleString(),
        })}
      </TextDisplay>
    </Container>
  );

  await message
    .reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    })
    .catch(console.error);
}
