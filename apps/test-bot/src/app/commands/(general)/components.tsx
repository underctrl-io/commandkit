import CommandKit, {
  ActionRow,
  Button,
  ChannelSelectMenu,
  ChatInputCommand,
  CommandData,
  Container,
  File,
  MediaGallery,
  MediaGalleryItem,
  OnChannelSelectMenuKitSubmit,
  Section,
  Separator,
  TextDisplay,
} from 'commandkit';
import {
  AttachmentBuilder,
  ButtonStyle,
  Colors,
  MessageFlags,
  SeparatorSpacingSize,
} from 'discord.js';

export const command: CommandData = {
  name: 'components',
  description: 'Test components v2',
};

const fileContent = '# This is a test file\nHello world!';
const mediaItems: string[] = Array.from(
  {
    length: 6,
  },
  (_, i) => `https://cdn.discordapp.com/embed/avatars/${i}.png`,
);

const handleSelect: OnChannelSelectMenuKitSubmit = async (
  interaction,
  context,
) => {
  const selections = interaction.channels.map((v) => v.toString()).join(', ');

  await interaction.reply({
    content: `You selected: ${selections}`,
  });

  context.dispose();
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const container = (
    <Container accentColor={Colors.Fuchsia}>
      <TextDisplay content="# CommandKit Components v2 test" />
      <Section>
        <TextDisplay content="This is a section" />
        <Button url="https://commandkit.dev" style={ButtonStyle.Link}>
          Website
        </Button>
      </Section>
      <Separator spacing={SeparatorSpacingSize.Large} />
      <TextDisplay content="This is after separator" />
      <File url="attachment://components-v2-are-awesome.md" />
      <Separator spacing={SeparatorSpacingSize.Large} dividier />
      <TextDisplay content="Discord's default avatars" />
      <MediaGallery>
        {mediaItems.map((item) => (
          <MediaGalleryItem description="Gallery item description" url={item} />
        ))}
      </MediaGallery>
      <ActionRow>
        <ChannelSelectMenu onSelect={handleSelect} />
      </ActionRow>
    </Container>
  );

  await ctx.interaction.reply({
    components: [container],
    files: [
      new AttachmentBuilder(Buffer.from(fileContent), {
        name: 'components-v2-are-awesome.md',
      }),
    ],
    flags: MessageFlags.IsComponentsV2,
  });
};
