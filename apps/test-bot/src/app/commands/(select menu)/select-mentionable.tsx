import CommandKit, {
  ActionRow,
  CommandData,
  MentionableSelectMenu,
  MentionableSelectMenuKit,
  OnSelectMenuKitSubmit,
  SlashCommand,
} from 'commandkit';
import { MentionableSelectMenuInteraction } from 'discord.js';

export const command: CommandData = {
  name: 'select-mentionable',
  description: 'Select a mentionable from a list',
};

const handleSelect: OnSelectMenuKitSubmit<
  MentionableSelectMenuInteraction,
  MentionableSelectMenuKit
> = async (interaction, context) => {
  const roles = interaction.roles.map((v) => v.toString()).join(', ');
  const users = interaction.users.map((v) => v.toString()).join(', ');

  await interaction.reply({
    content: `You selected: ${roles} roles and ${users} users`,
  });

  context.dispose();
};

export const chatInput: SlashCommand = async (ctx) => {
  const select = (
    <ActionRow>
      <MentionableSelectMenu onSelect={handleSelect} />
    </ActionRow>
  );

  await ctx.interaction.reply({
    components: [select],
    content: 'Select a mentionable from the list below:',
  });
};
