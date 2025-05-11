import {
  ChatInputCommandContext,
  CommandData,
  cacheTag,
  cacheLife,
} from 'commandkit';

export const command: CommandData = {
  name: 'random',
  description: 'This is a random command.',
};

const random = async () => {
  'use cache';

  cacheTag('random');
  cacheLife('1m');

  return Math.random();
};

export async function chatInput({ interaction }: ChatInputCommandContext) {
  await interaction.deferReply();

  const xp = await random();

  return interaction.editReply({
    content: `Random value is: ${xp}`,
  });
}
