import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationIntegrationType,
  ButtonStyle,
} from 'discord.js';
import {
  CommandData,
  ButtonKit,
  ChatInputCommandContext,
  AutocompleteCommandContext,
  CommandMetadata,
  MessageCommandContext,
  stopMiddlewares,
  Logger,
  unstable_after as after,
  CommandMetadataFunction,
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
  integration_types: [
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ],
  // guilds: ['1314834483660455938'],
};

// export const metadata: CommandMetadata = {
//   // userPermissions: 'Administrator',
//   // botPermissions: 'KickMembers',
//   // guilds: ['1314834483660455938'],
//   aliases: [''],
//   userPermissions: 'Administrator',
//   botPermissions: 'KickMembers',
//   guilds: ['1314834483660455938'],
// };

export const generateMetadata: CommandMetadataFunction = async () => {
  // Dynamically determine the metadata for the command

  return {
    userPermissions: 'Administrator',
    botPermissions: ['KickMembers', 'BanMembers'],
    // guilds: ['1234567890', '1234567891'],
    aliases: ['p', 'pong'],
  };
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

export async function message(ctx: MessageCommandContext) {
  Logger.debug`Store data ${ctx.store.get('foo')} | ${ctx.store}`;
  ctx.message.reply('Pong!');
}

export async function chatInput(ctx: ChatInputCommandContext) {
  const { interaction } = ctx;
  Logger.debug`Store data ${ctx.store.get('foo')} | ${ctx.store}`;

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

  after(() => {
    Logger.debug('after called in ping');
  });
}
