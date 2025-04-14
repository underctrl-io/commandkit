import { CommandData, ChatInputCommand } from 'commandkit';

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

export const chatInput: ChatInputCommand = async (ctx) => {
  const { interaction } = ctx;
  await interaction.deferReply();

  const botVersion = $botVersion();

  let i = 1;
  const commands = ctx.commandkit.commandsRouter
    .getData()
    .commands.map((c) => {
      return `${i++}. **\`/${c.name}\`** - ${c.category}`;
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
};
