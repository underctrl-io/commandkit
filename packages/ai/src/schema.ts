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
    embeds: z
      .array(
        z.object({
          title: z
            .string()
            .trim()
            .optional()
            .describe('The title of the embed. This is an optional field.'),
          description: z
            .string()
            .trim()
            .optional()
            .describe(
              'The description of the embed. This is an optional field.',
            ),
          url: z
            .string()
            .optional()
            .describe(
              'The URL of the embed. No need to specify this if it is not needed. It is not a required field.',
            ),
          color: z
            .number()
            .int()
            .min(0)
            .max(16777215)
            .optional()
            .describe(
              'The color of the embed in RGB format. This is an optional field.',
            ),
          image: z
            .object({
              url: z
                .string()
                .optional()
                .describe(
                  'The URL of the image in the embed. This is an optional field.',
                ),
            })
            .optional(),
          thumbnail: z
            .object({
              url: z
                .string()
                .optional()
                .describe(
                  'The URL of the thumbnail in the embed. This is an optional field.',
                ),
            })
            .optional(),
          fields: z
            .array(
              z.object({
                name: z
                  .string()
                  .trim()
                  .describe(
                    'The name of the field. This is an optional field.',
                  ),
                value: z
                  .string()
                  .trim()
                  .describe(
                    'The value of the field. This is an optional field.',
                  ),
                inline: z
                  .boolean()
                  .optional()
                  .default(false)
                  .describe(
                    'Whether the field is inline. This is an optional field. It defaults to false.',
                  ),
              }),
            )
            .max(25)
            .min(0)
            .optional()
            .describe('An array of fields in the embed'),
        }),
      )
      .max(10)
      .min(0)
      .optional()
      .describe('An array of embeds to include in the message'),
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
    'The schema for an AI response message, including content and embeds. At least one of content, embeds, or poll must be present.',
  );
