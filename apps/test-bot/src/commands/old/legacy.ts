import type { CommandData, SlashCommandProps } from '@commandkit/legacy';

export const data: CommandData = {
  name: 'legacy',
  description: 'Pong!',
};

export async function run({ interaction }: SlashCommandProps) {
  await interaction.reply('Hello from legacy command!');
}
