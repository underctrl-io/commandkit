import {
  SlashCommandProps,
  CommandData,
  unstable_invalidate as invalidate,
} from 'commandkit';

export const data: CommandData = {
  name: 'invalidate-random',
  description: 'This is a random command invalidation.',
};

export async function run({ interaction }: SlashCommandProps) {
  await interaction.deferReply();

  await invalidate('random');

  return interaction.editReply({
    content: `Random value has been invalidated.`,
  });
}
