import { SlashCommandProps, CommandData } from 'commandkit';

export const command: CommandData = {
  name: 'person',
  description: 'Random person name',
};

export async function chatInput({ interaction }: SlashCommandProps) {
  const names = ['John Doe', 'Jane Doe', 'Alice', 'Bob', 'Charlie'];

  const name = names[Math.floor(Math.random() * names.length)];

  return interaction.reply({
    content: `Random person name: ${name}`,
  });
}
