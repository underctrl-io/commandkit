import { z } from 'zod';

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
    'An object representing the media for a poll question, containing the text of the question. Emoji cannot be used in question text.',
  );

export const AiResponseSchema = z
  .object({
    content: z
      .string()
      .trim()
      .optional()
      .describe(
        'The content of the message. This can be plain text or markdown. This is an optional field.',
      ),
    embed: z
      .object({
        title: z
          .string()
          .trim()
          .optional()
          .describe('The title of the embed. This is an optional field.'),
        description: z
          .string()
          .trim()
          .optional()
          .describe('The description of the embed. This is an optional field.'),
        url: z
          .string()
          .optional()
          .describe(
            'A URL associated with the embed. This is an optional field.',
          ),
        color: z
          .number()
          .int()
          .min(0)
          .max(16777215)
          .optional()
          .describe(
            'A color for the embed, represented as an integer in RGB format. This is an optional field.',
          ),
        thumbnailImage: z
          .string()
          .optional()
          .describe('A URL for a thumbnail image. This is an optional field.'),
        image: z
          .string()
          .optional()
          .describe(
            'A URL for a main image in the embed. This is an optional field.',
          ),
        footer: z
          .string()
          .optional()
          .describe('The footer text of the embed. This is an optional field.'),
        footerIcon: z
          .string()
          .optional()
          .describe(
            'A URL for an icon to display in the footer of the embed. This is an optional field.',
          ),
        fields: z
          .array(
            z.object({
              name: z.string().trim().describe('The name of the field.'),
              value: z.string().trim().describe('The value of the field.'),
              inline: z
                .boolean()
                .optional()
                .default(false)
                .describe(
                  'Whether the field should be displayed inline with other fields. This is an optional field which defaults to false.',
                ),
            }),
          )
          .min(0)
          .max(25)
          .default([])
          .optional()
          .describe(
            'An array of fields to include in the embed. Each field should be an object with "name" and "value" properties. This is an optional field.',
          ),
      })
      .optional()
      .describe(
        'An object representing embeds to include in the discord message. This is an optional field.',
      ),
    poll: z
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
      .optional()
      .describe('An object representing a poll to include in the message'),
  })
  .describe(
    'The schema for an AI response message to be sent to discord, including content and embeds. At least one of content, embeds, or poll must be present.',
  );
