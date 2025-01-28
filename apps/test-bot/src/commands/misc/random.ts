import { SlashCommandProps, CommandData, cache } from 'commandkit';

export const data: CommandData = {
  name: 'random',
  description: 'This is a random command.',
};

const random = cache(
  async () => {
    return Math.random();
  },
  { tag: 'random', ttl: 60_000 },
);

export async function run({ interaction }: SlashCommandProps) {
  await interaction.deferReply();

  const xp = await random();

  return interaction.editReply({
    content: `Random value is: ${xp}`,
  });
}
