import { SlashCommandProps, CommandData, dmOnly } from 'commandkit';

export const command: CommandData = {
  name: 'dm-only',
  description: 'This is a dm only command',
};

export async function chatInput({ interaction }: SlashCommandProps) {
  dmOnly();

  await interaction.reply('This command can only be used in a dm.');
}
