import {
  Button,
  ActionRow,
  CommandData,
  OnButtonKitClick,
  ChatInputCommandContext,
  StringSelectMenu,
  StringSelectMenuOption,
  OnStringSelectMenuKitSubmit,
  ChatInputCommand,
  OnModalKitSubmit,
  Modal,
  ShortInput,
  ParagraphInput,
  TextDisplay,
  Container,
  Separator,
  MediaGallery,
  MediaGalleryItem,
  File,
} from 'commandkit';
import {
  AttachmentBuilder,
  ButtonStyle,
  Colors,
  MessageFlags,
  SeparatorSpacingSize,
} from 'discord.js';

export const command: CommandData = {
  name: 'commandkit',
  description: 'This is a commandkit command.',
};

// const handleButtonClick: OnButtonKitClick = async (interaction) => {
//   const { customId } = interaction;

//   await interaction.reply({
//     content: `You clicked the "${customId}" button!`,
//     flags: MessageFlags.Ephemeral,
//   });
// };

// function ButtonGrid() {
//   return (
//     <>
//       {Array.from({ length: 5 }, (_, i) => (
//         <ActionRow>
//           {Array.from({ length: 5 }, (_, j) => (
//             <Button
//               onClick={handleButtonClick}
//               customId={`button ${i * 5 + j + 1}`}
//             >
//               {i * 5 + j + 1}
//             </Button>
//           ))}
//         </ActionRow>
//       ))}
//     </>
//   );
// }

export const chatInput: ChatInputCommand = async ({ interaction }) => {
  const fileContent = '# Hello World\nThis is a test markdown file.';

  const container = (
    <Container accentColor={Colors.Blue}>
      <TextDisplay content="Here's a file:" />
      <File url="attachment://example.md" />
    </Container>
  );

  await interaction.reply({
    components: [container],
    files: [
      new AttachmentBuilder(Buffer.from(fileContent), {
        name: 'example.md',
      }),
    ],
    flags: MessageFlags.IsComponentsV2,
  });
};
