import { SlashCommandProps, CommandData, revalidate } from 'commandkit';

export const data: CommandData = {
  name: 'revalidate-random',
  description: 'This is a random command invalidation.',
};

export async function run({ interaction }: SlashCommandProps) {
  await interaction.deferReply();

  const revalidated = await revalidate<number>('random');

  return interaction.editReply({
    content: `Random value has been revalidated. The new value will be ${revalidated}`,
  });
}
