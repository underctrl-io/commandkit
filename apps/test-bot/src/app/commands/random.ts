import { ChatInputCommandContext, CommandData, cache } from 'commandkit';

export const command: CommandData = {
  name: 'random',
  description: 'This is a random command.',
};

const random = cache(
  async () => {
    return Math.random();
  },
  { name: 'random', ttl: 60_000 },
);

export async function chatInput({ interaction }: ChatInputCommandContext) {
  await interaction.deferReply();

  const xp = await random();

  return interaction.editReply({
    content: `Random value is: ${xp}`,
  });
}
