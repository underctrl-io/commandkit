import {
  SlashCommandProps,
  CommandOptions,
  CommandData,
} from '../../../../dist/index.mjs';

export const data: CommandData = {
  name: 'reload',
  description: 'Reload commands, events, and validations.',
};

export async function run({ interaction, handler }: SlashCommandProps) {
  await interaction.deferReply({ ephemeral: true });

  // await handler.reloadCommands();
  // console.log('Reloaded commands');

  // await handler.reloadEvents();
  // console.log('Reloaded events');

  await handler.reloadValidations();
  console.log('Reloaded validations.');
  interaction.followUp('Done!');
}

export const options: CommandOptions = {
  userPermissions: [],
  devOnly: true,
};
