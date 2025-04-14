import { CommandData, invalidate, ChatInputCommandContext } from 'commandkit';

export const command: CommandData = {
  name: 'invalidate-random',
  description: 'This is a random command invalidation.',
};

export async function chatInput({ interaction }: ChatInputCommandContext) {
  await interaction.deferReply();

  await invalidate('random');

  return interaction.editReply({
    content: `Random value has been invalidated.`,
  });
}
