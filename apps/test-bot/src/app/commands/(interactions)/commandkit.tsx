import {
  Button,
  ActionRow,
  CommandData,
  OnButtonKitClick,
  ChatInputCommandContext,
  StringSelectMenu,
  StringSelectMenuOption,
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

export async function chatInput({ interaction }: ChatInputCommandContext) {
  // await interaction.deferReply();

  // await interaction.editReply({
  //   content: 'Click the button below to test CommandKit buttons.',
  //   components: <ButtonGrid />,
  // });

  const firstRow = (
    <ActionRow>
      <Button style={ButtonStyle.Primary} customId="button-1">
        Primary Action
      </Button>
      <Button style={ButtonStyle.Secondary} customId="button-2">
        Secondary Action
      </Button>
    </ActionRow>
  );

  const secondRow = (
    <ActionRow>
      <Button style={ButtonStyle.Success} customId="button-3">
        Confirm
      </Button>
      <Button style={ButtonStyle.Danger} customId="button-4">
        Cancel
      </Button>
    </ActionRow>
  );

  await interaction.reply({
    components: [firstRow, secondRow],
  });
}
