import {
  Poll,
  PollQuestion,
  PollAnswer,
  CommandData,
  ChatInputCommand,
} from 'commandkit';
import { PollData } from 'discord.js';

export const command: CommandData = {
  name: 'poll',
  description: 'Create a poll',
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const poll: PollData = (
    <Poll>
      <PollQuestion>What's your favorite color?</PollQuestion>
      <PollAnswer emoji="🟥">Red</PollAnswer>
      <PollAnswer emoji="🟦">Blue</PollAnswer>
      <PollAnswer emoji="🟩">Green</PollAnswer>
      <PollAnswer>Other</PollAnswer>
    </Poll>
  );

  await ctx.interaction.reply({ poll });
};
