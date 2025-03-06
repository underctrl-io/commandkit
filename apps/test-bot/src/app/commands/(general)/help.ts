import { SlashCommandProps, CommandData } from 'commandkit';

export const command: CommandData = {
  name: 'help',
  description: 'This is a help command.',
};

function $botVersion(): string {
  'use macro';
  const { join } = require('node:path');
  const path = join(process.cwd(), 'package.json');
  return require(path).version;
}

export async function chatInput({ interaction, handler }: SlashCommandProps) {
  await interaction.deferReply();

  const botVersion = $botVersion();

  const commands = handler.commands
    .map((c, i) => {
      return `${i + 1}. **\`/${c.data.name}\`**`;
    })
    .join('\n');

  return interaction.editReply({
    embeds: [
      {
        title: 'Help',
        description: commands,
        footer: {
          text: `Bot Version: ${botVersion}`,
        },
        color: 0x7289da,
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
