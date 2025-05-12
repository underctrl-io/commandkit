import { revalidate } from '@commandkit/cache';
import { ChatInputCommandContext, CommandData } from 'commandkit';

export const command: CommandData = {
  name: 'revalidate-random',
  description: 'This is a random command invalidation.',
};

export async function chatInput({ interaction }: ChatInputCommandContext) {
  await interaction.deferReply();

  const revalidated = await revalidate<number>('random');

  return interaction.editReply({
    content: `Random value has been revalidated. The new value will be ${revalidated}`,
  });
}
