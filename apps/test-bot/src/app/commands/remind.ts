import type { CommandData, ChatInputCommand, MessageCommand } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';
import ms from 'ms';
import { createTask } from '@commandkit/tasks';
import { RemindTaskData } from '../tasks/remind';

export const command: CommandData = {
  name: 'remind',
  description: 'remind command',
  options: [
    {
      name: 'time',
      description: 'The time to remind after. Eg: 6h, 10m, 1d',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'message',
      description: 'The message to remind about.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const time = ctx.options.getString('time', true);
  const message = ctx.options.getString('message', true);
  const timeMs = Date.now() + ms(time as `${number}`);

  await createTask({
    name: 'remind',
    data: {
      userId: ctx.interaction.user.id,
      message,
      channelId: ctx.interaction.channelId,
      setAt: Date.now(),
    } satisfies RemindTaskData,
    schedule: {
      type: 'date',
      value: timeMs,
    },
  });

  await ctx.interaction.reply(
    `I will remind you <t:${Math.floor(timeMs / 1000)}:R> for \`${message}\``,
  );
};

export const message: MessageCommand = async (ctx) => {
  const [time, ...messageParts] = ctx.args();
  const message = messageParts.join(' ');
  const timeMs = Date.now() + ms(time as `${number}`);

  await createTask({
    name: 'remind',
    data: {
      userId: ctx.message.author.id,
      message,
      channelId: ctx.message.channelId,
      setAt: Date.now(),
    } satisfies RemindTaskData,
    schedule: {
      type: 'date',
      value: timeMs,
    },
  });

  await ctx.message.reply(
    `I will remind you <t:${Math.floor(timeMs / 1000)}:R> for \`${message}\``,
  );
};
