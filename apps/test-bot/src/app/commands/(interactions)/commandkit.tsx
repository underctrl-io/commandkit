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

const handleSelect: OnStringSelectMenuKitSubmit = async (
  interaction,
  context,
) => {
  const selections = interaction.values;
  await interaction.reply({
    content: `You selected: ${selections.join(', ')}`,
    flags: MessageFlags.Ephemeral,
  });
  context.dispose();
};

export const chatInput: ChatInputCommand = async ({ interaction }) => {
  const selectMenu = (
    <ActionRow>
      <StringSelectMenu
        placeholder="Choose multiple options"
        minValues={1}
        maxValues={3}
        onSelect={handleSelect}
      >
        <StringSelectMenuOption label="Pizza" value="pizza" emoji="🍕" />
        <StringSelectMenuOption label="Burger" value="burger" emoji="🍔" />
        <StringSelectMenuOption label="Pasta" value="pasta" emoji="🍝" />
        <StringSelectMenuOption label="Sushi" value="sushi" emoji="🍣" />
      </StringSelectMenu>
    </ActionRow>
  );

  await interaction.reply({
    content: 'Select your favorite foods (1-3 options):',
    components: [selectMenu],
  });
};
