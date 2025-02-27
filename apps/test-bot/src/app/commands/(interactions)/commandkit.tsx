import CommandKit, {
  Button,
  ActionRow,
  SlashCommandProps,
  CommandData,
  OnButtonKitClick,
} from 'commandkit';
import { MessageFlags } from 'discord.js';

export const command: CommandData = {
  name: 'commandkit',
  description: 'This is a commandkit command.',
};

const handleButtonClick: OnButtonKitClick = async (interaction) => {
  const { customId } = interaction;

  await interaction.reply({
    content: `You clicked the "${customId}" button!`,
    flags: MessageFlags.Ephemeral,
  });
};

function ButtonGrid() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <ActionRow>
          {Array.from({ length: 5 }, (_, j) => (
            <Button
              onClick={handleButtonClick}
              customId={`button ${i * 5 + j + 1}`}
            >
              {i * 5 + j + 1}
            </Button>
          ))}
        </ActionRow>
      ))}
    </>
  );
}

export async function chatInput({ interaction }: SlashCommandProps) {
  await interaction.deferReply();

  await interaction.editReply({
    content: 'Click the button below to test CommandKit buttons.',
    components: <ButtonGrid />,
  });
}
