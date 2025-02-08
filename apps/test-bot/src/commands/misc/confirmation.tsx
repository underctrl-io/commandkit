import CommandKit, {
  Button,
  ActionRow,
  SlashCommandProps,
  CommandData,
  OnButtonKitClick,
} from 'commandkit';
import { ButtonStyle, MessageFlags } from 'discord.js';

export const data: CommandData = {
  name: 'confirm',
  description: 'This is a confirm command.',
};

const handleConfirm: OnButtonKitClick = async (interaction, context) => {
  await interaction.reply({
    content: 'The item was deleted successfully.',
    flags: MessageFlags.Ephemeral,
  });

  context.dispose();
};

const handleCancel: OnButtonKitClick = async (interaction, context) => {
  await interaction.reply({
    content: 'The item was not deleted.',
    flags: MessageFlags.Ephemeral,
  });

  context.dispose();
};

export async function run({ interaction }: SlashCommandProps) {
  const buttons = (
    <ActionRow>
      <Button onClick={handleCancel} style={ButtonStyle.Primary}>
        Cancel
      </Button>
      <Button onClick={handleConfirm} style={ButtonStyle.Danger}>
        Confirm
      </Button>
    </ActionRow>
  );

  await interaction.reply({
    content: 'Are you sure you want to delete this item?',
    components: [buttons],
  });
}
