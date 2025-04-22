import CommandKit, {
  ActionRow,
  ChannelSelectMenu,
  CommandData,
  OnChannelSelectMenuKitSubmit,
  ChatInputCommand,
} from 'commandkit';

export const command: CommandData = {
  name: 'select-channel',
  description: 'Select a channel from a list',
};

const handleSelect: OnChannelSelectMenuKitSubmit = async (
  interaction,
  context,
) => {
  const selections = interaction.channels.map((v) => v.toString()).join(', ');

  await interaction.reply({
    content: `You selected: ${selections}`,
  });

  context.dispose();
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const select = (
    <ActionRow>
      <ChannelSelectMenu onSelect={handleSelect} />
    </ActionRow>
  );

  await ctx.interaction.reply({
    components: [select],
    content: 'Select a channel from the list below:',
  });
};
