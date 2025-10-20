import {
  type CommandData,
  type ChatInputCommand,
  type MessageCommand,
  Container,
  MediaGallery,
  MediaGalleryItem,
  TextDisplay,
  Separator,
} from 'commandkit';
import { AttachmentBuilder, Colors, Guild, MessageFlags } from 'discord.js';
import { getLeaderboardCard } from './_leaderboard.utils';
import { locale } from '@commandkit/i18n';

export const command: CommandData = {
  name: 'leaderboard',
  description: 'leaderboard command',
};

function Component({ attachment }: { attachment: AttachmentBuilder }) {
  const { t } = locale();
  const url = `attachment://${attachment.name}`;

  return (
    <Container accentColor={Colors.Blurple}>
      <TextDisplay># {t('title')}</TextDisplay>
      <Separator />
      <MediaGallery>
        <MediaGalleryItem url={url} />
      </MediaGallery>
    </Container>
  );
}

export const chatInput: ChatInputCommand = async (ctx) => {
  const { t } = ctx.locale();
  await ctx.interaction.deferReply();

  const leaderboard = await getLeaderboardCard(ctx.guild!);

  if (!leaderboard) {
    await ctx.interaction.editReply({
      content: t('no_players'),
    });

    return;
  }

  await ctx.interaction.editReply({
    components: [<Component attachment={leaderboard} />],
    files: [leaderboard],
    flags: MessageFlags.IsComponentsV2,
  });
};

export const message: MessageCommand = async (ctx) => {
  const { t } = ctx.locale();
  const leaderboard = await getLeaderboardCard(ctx.guild!);

  if (!leaderboard) {
    await ctx.message.reply({
      content: t('no_players'),
    });

    return;
  }

  await ctx.message.reply({
    files: [leaderboard],
    components: [<Component attachment={leaderboard} />],
    flags: MessageFlags.IsComponentsV2,
  });
};
