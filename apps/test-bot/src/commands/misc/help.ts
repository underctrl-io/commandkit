import { SlashCommandProps, CommandData } from 'commandkit';

export const data: CommandData = {
  name: 'help',
  description: 'This is a help command.',
};

export async function run({ interaction }: SlashCommandProps) {
  await interaction.deferReply();

  return interaction.editReply({
    embeds: [
      {
        title: 'Help',
        description: `This is a help command.`,
        color: 0x7289da,
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
