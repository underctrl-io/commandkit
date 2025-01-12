import {
  SlashCommandProps,
  CommandData,
  unstable_cacheTag as cacheTag,
} from 'commandkit';
import { setTimeout } from 'node:timers/promises';

export const data: CommandData = {
  name: 'help',
  description: 'This is a help command.',
};

async function someExpensiveDatabaseCall() {
  'use cache';

  await setTimeout(5000);

  return Date.now();
}

cacheTag(15000, someExpensiveDatabaseCall);

export async function run({ interaction }: SlashCommandProps) {
  await interaction.deferReply();

  const dataRetrievalStart = Date.now();
  const time = await someExpensiveDatabaseCall();
  const dataRetrievalEnd = Date.now() - dataRetrievalStart;

  return interaction.editReply({
    embeds: [
      {
        title: 'Help',
        description: `This is a help command. The current time is \`${time}\`. Fetched in ${dataRetrievalEnd}ms.`,
        color: 0x7289da,
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
