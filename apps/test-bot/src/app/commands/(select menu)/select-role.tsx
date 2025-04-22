import CommandKit, {
  ActionRow,
  CommandData,
  OnRoleSelectMenuKitSubmit,
  RoleSelectMenu,
  ChatInputCommand,
} from 'commandkit';

export const command: CommandData = {
  name: 'select-role',
  description: 'Select a role from a list',
};

const handleSelect: OnRoleSelectMenuKitSubmit = async (
  interaction,
  context,
) => {
  const selections = interaction.roles.map((v) => v.toString()).join(', ');

  await interaction.reply({
    content: `You selected: ${selections}`,
  });

  context.dispose();
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const select = (
    <ActionRow>
      <RoleSelectMenu onSelect={handleSelect} />
    </ActionRow>
  );

  await ctx.interaction.reply({
    components: [select],
    content: 'Select a channel from the list below:',
  });
};
