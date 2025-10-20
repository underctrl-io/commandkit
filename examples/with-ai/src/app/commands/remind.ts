import type { CommandData, ChatInputCommand, MessageCommand } from 'commandkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { createTask } from '@commandkit/tasks';
import { RemindTaskData } from '../tasks/remind';
import ms from 'ms';
import { AiCommand, AiConfig } from '@commandkit/ai';
import { z } from 'zod';

export const command: CommandData = {
  name: 'remind',
  description: 'remind command',
  options: [
    {
      name: 'time',
      description: 'The time to remind you',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'message',
      description: 'The message to remind you',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export const aiConfig = {
  inputSchema: z.object({
    time: z
      .string()
      .describe(
        'The time to remind after. Example: 10s, 10m, 10h, 10d, 10w, 10y',
      ),
    message: z
      .string()
      .describe('The message to show when the reminder is triggered'),
  }),
} satisfies AiConfig;

const createReminder = async (time: number, data: RemindTaskData) => {
  if (time + Date.now() < Date.now()) {
    return {
      error: 'The time is in the past',
    };
  }

  const schedule = time + Date.now();

  await createTask({
    name: 'remind',
    schedule,
    data,
  });

  return {
    timer: schedule,
  };
};

export const chatInput: ChatInputCommand = async (ctx) => {
  const time = ctx.interaction.options.getString('time', true);
  const message = ctx.interaction.options.getString('message', true);
  const timeMs = ms(time as `${number}`);

  const { error, timer } = await createReminder(timeMs, {
    userId: ctx.interaction.user.id,
    channelId: ctx.interaction.channelId,
    message,
  });

  if (error) {
    await ctx.interaction.reply(error);
    return;
  }

  await ctx.interaction.reply(
    `Reminder set for <t:${Math.floor(timer! / 1000)}:R>`,
  );
};

export const message: MessageCommand = async (ctx) => {
  const [time, ...messageParts] = ctx.args();
  const message = messageParts.join(' ');

  if (!time || !message) {
    await ctx.message.reply('Please provide a time and message');
    return;
  }

  const timeMs = ms(time as `${number}`);

  const { error, timer } = await createReminder(timeMs, {
    userId: ctx.message.author.id,
    channelId: ctx.message.channel.id,
    message,
  });

  if (error) {
    await ctx.message.reply(error);
    return;
  }

  await ctx.message.reply(
    `Reminder set for <t:${Math.floor(timer! / 1000)}:R>`,
  );
};

export const ai: AiCommand<typeof aiConfig> = async (ctx) => {
  const { time, message } = ctx.ai.params;

  const timeMs = ms(time as `${number}`);

  const { error, timer } = await createReminder(timeMs, {
    userId: ctx.message.author.id,
    channelId: ctx.message.channel.id,
    message,
  });

  if (error) {
    return {
      error,
    };
  }

  return {
    success: `Reminder set for <t:${Math.floor(
      timer! / 1000,
    )}:R>. Show this markdown to the user for live updates on discord.`,
  };
};
