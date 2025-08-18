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
  const headerContainer = (
    <Container accentColor={Colors.Blue}>
      <TextDisplay content="# Bot Status Report" />
      <TextDisplay
        content={`Generated on <t:${Math.floor(Date.now() / 1000)}:F>`}
      />
    </Container>
  );

  const statsContainer = (
    <Container accentColor={Colors.Green}>
      <TextDisplay content="## Server Statistics" />
      <TextDisplay content="**Servers:** 50" />
      <TextDisplay content="**Users:** 15,000" />
      <TextDisplay content="**Commands executed:** 1,250 today" />
    </Container>
  );

  const alertsContainer = (
    <Container accentColor={Colors.Yellow}>
      <TextDisplay content="## System Alerts" />
      <TextDisplay content="⚠️ Scheduled maintenance in 2 hours" />
      <TextDisplay content="✅ All systems operational" />
    </Container>
  );

  await interaction.reply({
    components: [headerContainer, statsContainer, alertsContainer],
    flags: MessageFlags.IsComponentsV2,
  });
};
