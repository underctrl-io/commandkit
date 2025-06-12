import {
  Button,
  ActionRow,
  ChatInputCommandContext,
  CommandData,
  OnButtonKitClick,
} from 'commandkit';
import { ButtonStyle, MessageFlags } from 'discord.js';
import { AiConfig, AiCommand } from '@commandkit/ai';
import { z } from 'zod';

export const command: CommandData = {
  name: 'confirmation',
  description: 'This is a confirm command.',
};

export const aiConfig = {
  parameters: z.object({
    message: z
      .string()
      .describe('The message to be shown in the confirmation.'),
  }),
  description: 'Confirm an action with buttons.',
} satisfies AiConfig;

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

export async function chatInput({ interaction }: ChatInputCommandContext) {
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

export const ai: AiCommand<typeof aiConfig> = async (ctx) => {
  const message = ctx.ai.params.message;

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

  await ctx.message.reply({
    content: message || 'There was no confirmation message provided.',
    components: [buttons],
  });
};
