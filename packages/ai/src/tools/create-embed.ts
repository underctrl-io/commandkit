import { z } from 'zod';
import { createTool } from './common';
import { ColorResolvable, EmbedBuilder } from 'discord.js';

export const createEmbed = createTool({
  name: 'createEmbed',
  description: 'Create an embed message',
  inputSchema: z.object({
    title: z.string().describe('The title of the embed').optional(),
    url: z.string().describe('The URL of the embed').optional(),
    description: z.string().describe('The description of the embed').optional(),
    color: z.string().describe('The color of the embed').optional(),
    fields: z
      .array(
        z.object({
          name: z.string().describe('The name of the field'),
          value: z.string().describe('The value of the field'),
          inline: z.boolean().describe('Whether the field is inline'),
        }),
      )
      .describe('The fields of the embed')
      .optional(),
    author: z
      .object({
        name: z.string().describe('The name of the author'),
        url: z.string().describe('The URL of the author'),
        iconUrl: z.string().describe('The icon URL of the author'),
      })
      .describe('The author of the embed')
      .optional(),
    footer: z
      .object({
        text: z.string().describe('The text of the footer'),
        iconUrl: z.string().describe('The icon URL of the footer'),
      })
      .describe('The footer of the embed')
      .optional(),
    timestamp: z
      .boolean()
      .describe('Whether to add a timestamp to the embed')
      .optional(),
    image: z.string().describe('The image URL of the embed').optional(),
    thumbnail: z.string().describe('The thumbnail URL of the embed').optional(),
  }),
  execute: async (ctx, params) => {
    const { message } = ctx;

    if (!message.channel.isSendable()) {
      return {
        error: 'You do not have permission to send messages in this channel',
      };
    }

    const embed = new EmbedBuilder();

    if (params.title) {
      embed.setTitle(params.title);
    }

    if (params.description) {
      embed.setDescription(params.description);
    }

    if (params.color) {
      embed.setColor(
        (!Number.isNaN(params.color)
          ? Number(params.color)
          : params.color) as ColorResolvable,
      );
    }

    if (params.fields) {
      embed.addFields(params.fields);
    }

    if (params.author) {
      embed.setAuthor(params.author);
    }

    if (params.footer) {
      embed.setFooter(params.footer);
    }

    if (params.timestamp) {
      embed.setTimestamp();
    }

    if (params.image) {
      embed.setImage(params.image);
    }

    if (params.thumbnail) {
      embed.setThumbnail(params.thumbnail);
    }

    await message.channel.send({ embeds: [embed] });

    return {
      success: true,
      message: 'Embedded message was sent to the channel successfully',
    };
  },
});
