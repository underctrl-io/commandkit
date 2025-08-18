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
} from 'commandkit';
import { ButtonStyle, MessageFlags } from 'discord.js';

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

const handleSubmit: OnModalKitSubmit = async (interaction, context) => {
  const name = interaction.fields.getTextInputValue('name');
  const description = interaction.fields.getTextInputValue('description');

  await interaction.reply({
    content: `**Profile Created!**\n**Name:** ${name}\n**Description:** ${description}`,
    flags: MessageFlags.Ephemeral,
  });

  context.dispose();
};

export const chatInput: ChatInputCommand = async ({ interaction }) => {
  const modal = (
    <Modal title="User Profile" onSubmit={handleSubmit}>
      <ShortInput
        customId="name"
        label="Name"
        placeholder="Enter your name"
        required
      />
      <ParagraphInput
        customId="description"
        label="Description"
        placeholder="Tell us about yourself"
      />
    </Modal>
  );

  await interaction.showModal(modal);
};
