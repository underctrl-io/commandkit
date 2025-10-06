import { CommandData, ChatInputCommand } from 'commandkit';
import { redEmbedColor } from '@/feature-flags/red-embed-color';
import { Colors } from 'discord.js';

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
  const showRedColor = await redEmbedColor();

  const { interaction } = ctx;
  await interaction.deferReply();

  const botVersion = $botVersion();

  let i = 1;
  const commands = ctx.commandkit.commandHandler
    .getCommandsArray()
    .map((c) => {
      const cmdName = c.data.command.name;
      const cmd = c.discordId
        ? `</${cmdName}:${c.discordId}>`
        : `**\`/${cmdName}\`**`;
      return `${i++}. ${cmd} - ${c.command.category ?? 'N/A'}`;
    })
    .join('\n');

  return interaction.editReply({
    embeds: [
      {
        title: 'Help',
        description: commands,
        footer: {
          text: `Bot Version: ${botVersion} | Shard ID ${interaction.guild?.shardId ?? 'N/A'}`,
        },
        color: showRedColor ? Colors.Red : Colors.Blurple,
        timestamp: new Date().toISOString(),
      },
    ],
  });
};
