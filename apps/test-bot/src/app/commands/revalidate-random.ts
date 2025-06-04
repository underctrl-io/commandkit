import { revalidateTag } from '@commandkit/cache';
import { ChatInputCommandContext, CommandData } from 'commandkit';

export const command: CommandData = {
  name: 'revalidate-random',
  description: 'This is a random command invalidation.',
};

export async function chatInput({ interaction }: ChatInputCommandContext) {
  await interaction.deferReply();

  await revalidateTag('random');

  return interaction.editReply({
    content: `Random value has been revalidated.`,
  });
}
