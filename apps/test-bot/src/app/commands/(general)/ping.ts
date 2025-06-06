import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} from 'discord.js';
import {
  CommandData,
  ButtonKit,
  ChatInputCommandContext,
  AutocompleteCommandContext,
} from 'commandkit';

export const command: CommandData = {
  name: 'ping',
  description: 'Pong!',
  options: [
    {
      name: 'test',
      description: 'Test option for autocomplete',
      autocomplete: true,
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
};

const tests = Array.from({ length: 10 }, (_, i) => ({
  name: `Test ${i + 1}`,
  value: `${i}_test`,
}));

export async function autocomplete({
  interaction,
}: AutocompleteCommandContext) {
  const arg = interaction.options.getString('test', false);
  console.log(arg);
  if (!arg) return interaction.respond(tests);

  const filtered = tests.filter((test) =>
    test.name.toLowerCase().includes(arg.toLowerCase()),
  );

  interaction.respond(filtered);
}

export async function chatInput({
  interaction,
  client,
}: ChatInputCommandContext) {
  if (!interaction.channel) return;

  const button = new ButtonKit()
    .setCustomId('ping_btn')
    .setStyle(ButtonStyle.Primary)
    .setLabel('Ping Button!');

  const row = new ActionRowBuilder<ButtonKit>().addComponents(button);

  const message = await interaction.reply({
    content: 'Click one of the buttons',
    components: [row],
    fetchReply: true,
  });

  button
    .onClick(
      (inter) => {
        console.log('onClick called');

        inter.reply({
          content: 'You clicked the ping button!',
          ephemeral: true,
        });
      },
      { time: 10_000, autoReset: true },
    )
    .onEnd(() => {
      console.log('onEnd called');

      button.setDisabled(true);
      message.edit({ components: [row] });
    });
}
