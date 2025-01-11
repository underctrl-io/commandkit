import { SlashCommandProps, CommandData, dmOnly } from 'commandkit';

export const data: CommandData = {
  name: 'dm-only',
  description: 'This is a dm only command',
};

export async function run({ interaction }: SlashCommandProps) {
  dmOnly();

  await interaction.reply('This command can only be used in a dm.');
}
