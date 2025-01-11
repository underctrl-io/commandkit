import { unstable_cache, SlashCommandProps, CommandData } from 'commandkit';
import { setTimeout } from 'node:timers/promises';

export const data: CommandData = {
  name: 'help',
  description: 'This is a help command.',
};

function $botVersion() {
  'use macro';
  // this function is inlined in production build
  const process = require('node:process');
  return require(`${process.cwd()}/package.json`).version;
}

async function someExpensiveDatabaseCall() {
  await setTimeout(3000);
  return Date.now();
}

export async function run({ interaction }: SlashCommandProps) {
  await unstable_cache({ name: interaction.commandName, ttl: 60_000 });

  await interaction.deferReply();

  const time = await someExpensiveDatabaseCall();

  const version = $botVersion();

  return interaction.editReply({
    embeds: [
      {
        title: 'Help',
        description: `This is a help command. The current time is \`${time}\``,
        color: 0x7289da,
        footer: {
          text: `Bot Version: ${version}`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
