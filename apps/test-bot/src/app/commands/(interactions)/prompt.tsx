import CommandKit, {
  CommandData,
  Modal,
  ShortInput,
  ParagraphInput,
  OnModalKitSubmit,
  MessageCommandContext,
  SlashCommandContext,
} from 'commandkit';
import { MessageFlags } from 'discord.js';

export const command: CommandData = {
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

export async function chatInput(ctx: SlashCommandContext) {
  const { t } = ctx.locale();

  const title = await t('modal.title');
  const label = await t('input.label');
  const description = await t('input.placeholder');

  const modal = (
    <Modal title={title} onSubmit={handleSubmit}>
      <ShortInput customId="name" label="Name" placeholder="John" required />
      <ParagraphInput
        customId="description"
        label={label}
        placeholder={description}
      />
    </Modal>
  );

  await ctx.interaction.showModal(modal);
}

export async function message(ctx: MessageCommandContext) {
  ctx.message.reply('Prompt is only available in slash commands.');
}
