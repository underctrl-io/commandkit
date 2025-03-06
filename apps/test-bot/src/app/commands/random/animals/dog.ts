import { SlashCommandProps, CommandData } from 'commandkit';

export const command: CommandData = {
  name: 'dog',
  description: 'This is a random dog command',
};

export async function chatInput({ interaction }: SlashCommandProps) {
  const { data } = await fetch('https://random.dog/woof.json').then((res) =>
    res.json(),
  );

  return interaction.reply({
    embeds: [
      {
        title: 'Random Dog',
        image: {
          url: data.url,
        },
        color: 0x7289da,
      },
    ],
  });
}
