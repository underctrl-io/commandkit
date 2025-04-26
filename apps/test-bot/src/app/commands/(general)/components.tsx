import CommandKit, {
  Button,
  ChatInputCommand,
  CommandData,
  Container,
  File,
  MediaGallery,
  MediaGalleryItem,
  Section,
  Separator,
  TextDisplay,
} from 'commandkit';
import {
  AttachmentBuilder,
  ButtonStyle,
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

export const chatInput: ChatInputCommand = async (ctx) => {
  const container = (
    <Container>
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
