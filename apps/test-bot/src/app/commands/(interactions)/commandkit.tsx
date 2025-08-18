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
} from 'commandkit';
import {
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
  const images = [
    'https://cdn.discordapp.com/embed/avatars/0.png',
    'https://cdn.discordapp.com/embed/avatars/1.png',
    'https://cdn.discordapp.com/embed/avatars/2.png',
  ];

  const components = [
    <TextDisplay content="# Discord Avatars Gallery" />,
    <MediaGallery>
      {images.map((url, index) => (
        <MediaGalleryItem url={url} description={`Avatar ${index + 1}`} />
      ))}
    </MediaGallery>,
  ];

  await interaction.reply({
    components: components,
    flags: MessageFlags.IsComponentsV2,
  });
};
