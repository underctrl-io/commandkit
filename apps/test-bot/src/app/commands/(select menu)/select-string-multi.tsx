import {
  ActionRow,
  CommandData,
  OnStringSelectMenuKitSubmit,
  ChatInputCommand,
  StringSelectMenu,
  StringSelectMenuOption,
} from 'commandkit';

export const command: CommandData = {
  name: 'select-string-multi',
  description: 'Select multiple strings from a list',
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
      <StringSelectMenu onSelect={handleSelect} maxValues={9} minValues={1}>
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
        <StringSelectMenuOption
          label="Jigglypuff"
          value="jigglypuff"
          description="Jigglypuff is fairy"
          emoji="🌙"
        />
        <StringSelectMenuOption
          label="Meowth"
          value="meowth"
          description="Meowth is normal"
          emoji="😺"
        />
        <StringSelectMenuOption
          label="Mewtwo"
          value="mewtwo"
          description="Mewtwo is psychic"
          emoji="🧠"
        />
        <StringSelectMenuOption
          label="Gengar"
          value="gengar"
          description="Gengar is ghost"
          emoji="👻"
        />
        <StringSelectMenuOption
          label="Eevee"
          value="eevee"
          description="Eevee is normal"
          emoji="🐾"
        />
      </StringSelectMenu>
    </ActionRow>
  );

  await ctx.interaction.reply({
    components: [select],
    content: 'Select a channel from the list below:',
  });
};
