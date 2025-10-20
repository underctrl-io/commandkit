import type { CommandData, ChatInputCommand, MessageCommand } from 'commandkit';
import type { AiCommand, AiConfig } from 'commandkit/ai';
import { ApplicationCommandOptionType, PermissionsBitField } from 'discord.js';
import { z } from 'zod';

export const command: CommandData = {
  name: 'poll',
  description: 'Create a poll',
  options: [
    {
      name: 'question',
      description: 'The question of the poll',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'answers',
      description: 'The answers of the poll separated by commas',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'allow_multiselect',
      description: 'Whether the poll allows multiple selections',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: 'duration',
      description: 'The duration of the poll in hours',
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ],
};

const pollMediaObject = z
  .object({
    text: z.string().trim().describe('The question text of the poll'),
    emoji: z
      .string()
      .trim()
      .optional()
      .describe('An optional emoji associated with the poll question. Eg: 👍'),
  })
  .describe(
    'An object representing the media for a poll question, containing the text of the question. Emoji cannot be used in question text.'
  );

export const aiConfig = {
  inputSchema: z
    .object({
      question: pollMediaObject,
      answers: z
        .array(pollMediaObject)
        .min(1)
        .max(10)
        .describe('An array of answers for the poll'),
      allow_multiselect: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether the poll allows multiple selections'),
      duration: z
        .number()
        .int()
        .min(1)
        .max(32)
        .optional()
        .default(24)
        .describe('The duration of the poll in hours'),
    })
    .describe('An object representing a poll to include in the message'),
} satisfies AiConfig;

export const chatInput: ChatInputCommand = async (ctx) => {
  const question = ctx.options.getString('question', true);
  const answers = ctx.options.getString('answers', true);
  const allowMultiselect = ctx.options.getBoolean('allow_multiselect');
  const duration = ctx.options.getNumber('duration');

  await ctx.interaction.reply({
    poll: {
      allowMultiselect: !!allowMultiselect,
      answers: answers.split(',').map((answer) => {
        return {
          text: answer.trim(),
          emoji: '',
        };
      }),
      duration: duration ?? 24,
      question: { text: question },
    },
  });
};

export const ai: AiCommand<typeof aiConfig> = async (ctx) => {
  if (!ctx.message.inGuild()) {
    return {
      error: 'Poll can only be created in a server',
    };
  }

  const hasPermission = ctx.message.channel
    .permissionsFor(ctx.message.client.user!)
    ?.has(PermissionsBitField.Flags.SendMessages);

  if (!hasPermission) {
    return {
      error: 'Bot does not have the permission to send polls in this channel',
    };
  }

  const { question, answers, allow_multiselect, duration } = ctx.ai.params;

  await ctx.message.channel.send({
    poll: {
      allowMultiselect: !!allow_multiselect,
      answers: answers.map((answer) => ({
        text: answer.text,
        emoji: answer.emoji,
      })),
      duration: duration ?? 24,
      question: { text: question.text },
    },
  });
};
