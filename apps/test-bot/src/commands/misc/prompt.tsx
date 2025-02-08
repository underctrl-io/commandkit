import CommandKit, {
  SlashCommandProps,
  CommandData,
  Modal,
  ShortInput,
  ParagraphInput,
  OnModalKitSubmit,
} from 'commandkit';
import { MessageFlags } from 'discord.js';

export const data: CommandData = {
  name: 'prompt',
  description: 'This is a prompt command.',
};

const handleSubmit: OnModalKitSubmit = async (interaction, context) => {
  const name = interaction.fields.getTextInputValue('name');
  const description = interaction.fields.getTextInputValue('description');

  await interaction.reply({
    content: `Name: ${name}\nDescription: ${description}`,
    flags: MessageFlags.Ephemeral,
  });

  context.dispose();
};

export async function run({ interaction }: SlashCommandProps) {
  const modal = (
    <Modal title="My Cool Modal" onSubmit={handleSubmit}>
      <ShortInput customId="name" label="Name" placeholder="John" required />
      <ParagraphInput
        customId="description"
        label="Description"
        placeholder="This is a description."
      />
    </Modal>
  );

  await interaction.showModal(modal);
}
