import {
  ActionRow,
  CommandData,
  OnUserSelectMenuKitSubmit,
  ChatInputCommand,
  UserSelectMenu,
} from 'commandkit';

export const command: CommandData = {
  name: 'select-user',
  description: 'Select a user from a list',
};

const handleSelect: OnUserSelectMenuKitSubmit = async (
  interaction,
  context,
) => {
  const selections = interaction.users.map((v) => v.toString()).join(', ');

  await interaction.reply({
    content: `You selected: ${selections}`,
  });

  context.dispose();
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const select = (
    <ActionRow>
      <UserSelectMenu onSelect={handleSelect} />
    </ActionRow>
  );

  await ctx.interaction.reply({
    components: [select],
    content: 'Select a channel from the list below:',
  });
};
