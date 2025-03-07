import { SlashCommandProps, CommandData } from 'commandkit';

export const command: CommandData = {
  name: 'computer',
  description: 'Random computer name',
};

export async function chatInput({ interaction }: SlashCommandProps) {
  const names = ['HAL 9000', 'R2-D2', 'C-3PO', 'Data', 'Bender', 'GLaDOS'];

  const name = names[Math.floor(Math.random() * names.length)];

  return interaction.reply({
    content: `Random computer name: ${name}`,
  });
}
