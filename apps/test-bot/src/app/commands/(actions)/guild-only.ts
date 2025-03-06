import { SlashCommandProps, CommandData, guildOnly } from 'commandkit';

export const command: CommandData = {
  name: 'guild-only',
  description: 'This is a guild only command.',
};

export async function chatInput({ interaction }: SlashCommandProps) {
  guildOnly();

  await interaction.reply('This command can only be used in a guild.');
}
