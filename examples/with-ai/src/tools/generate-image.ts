import { createTool } from '@commandkit/ai';
import { z } from 'zod';
import {
  AttachmentBuilder,
  GuildTextBasedChannel,
  PermissionFlagsBits,
} from 'discord.js';
import { Logger } from 'commandkit';

async function generateImage(prompt: string) {
  const form = new FormData();
  form.append('prompt', prompt.slice(0, 1000));

  const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.CLIPDROP_API_KEY!,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to generate image: ${response.status} ${response.statusText}`
    );
  }

  const buffer = await response.arrayBuffer();

  return Buffer.from(buffer);
}

export const generateImageTool = createTool({
  name: 'generate-image',
  description: 'Generate an image with the given prompt',
  inputSchema: z.object({
    prompt: z
      .string()
      .describe('The prompt to use in order to generate an image'),
  }),
  async execute(ctx, parameters) {
    const { prompt } = parameters;
    const { message } = ctx;

    const channel = message.channel;

    if (!channel.isSendable()) {
      return {
        error: 'Cannot send message in this channel',
      };
    }

    if (message.inGuild()) {
      const me = await message.guild.members.fetchMe({
        cache: true,
        force: false,
      });
      const canSendImage = (channel as GuildTextBasedChannel)
        .permissionsFor(me)
        .has(PermissionFlagsBits.AttachFiles);

      if (!canSendImage) {
        return {
          error: 'No permission to send attachments in this channel',
        };
      }
    }

    try {
      const result = await generateImage(prompt);

      const file = new AttachmentBuilder(result, {
        name: `attachment-${message.id}.png`,
        description: message.content.slice(0, 30),
      });

      await channel.send({
        content: `Here is the image I generated for you:`,
        files: [file],
      });

      return {
        success: true,
        message: 'Image was generated and sent to the channel successfully',
      };
    } catch (e) {
      Logger.error(e instanceof Error ? e.stack : e);

      return {
        error: 'Could not generate image due to an unknown error',
      };
    }
  },
});
