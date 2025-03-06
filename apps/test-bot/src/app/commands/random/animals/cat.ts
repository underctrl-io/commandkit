import { SlashCommandProps, CommandData } from 'commandkit';

export const command: CommandData = {
  name: 'cat',
  description: 'This is a random cat command',
};

export async function chatInput({ interaction }: SlashCommandProps) {
  const { data } = await fetch('https://aws.random.cat/meow').then((res) =>
    res.json(),
  );

  return interaction.reply({
    embeds: [
      {
        title: 'Random Cat',
        image: {
          url: data.file,
        },
        color: 0x7289da,
      },
    ],
  });
}
