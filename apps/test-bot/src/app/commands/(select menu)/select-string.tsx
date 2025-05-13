import {
  ActionRow,
  CommandData,
  OnStringSelectMenuKitSubmit,
  ChatInputCommand,
  StringSelectMenu,
  StringSelectMenuOption,
} from 'commandkit';

export const command: CommandData = {
  name: 'select-string',
  description: 'Select a string from a list',
};

const handleSelect: OnStringSelectMenuKitSubmit = async (
  interaction,
  context,
) => {
  const selections = interaction.values.map((v) => v.toString()).join(', ');

  await interaction.reply({
    content: `You selected: ${selections}`,
  });

  context.dispose();
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const select = (
    <ActionRow>
      <StringSelectMenu onSelect={handleSelect}>
        <StringSelectMenuOption
          label="Pikachu"
          value="pikachu"
          description="Pikachu is electric"
          emoji="⚡"
        />
        <StringSelectMenuOption
          label="Charmander"
          value="charmander"
          description="Charmander is fire"
          emoji="🔥"
        />
        <StringSelectMenuOption
          label="Squirtle"
          value="squirtle"
          description="Squirtle is water"
          emoji="💧"
        />
        <StringSelectMenuOption
          label="Bulbasaur"
          value="bulbasaur"
          description="Bulbasaur is grass"
          emoji="🌱"
        />
      </StringSelectMenu>
    </ActionRow>
  );

  await ctx.interaction.reply({
    components: [select],
    content: 'Select a channel from the list below:',
  });
};
