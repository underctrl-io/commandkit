import type { CommandData, MessageCommand } from 'commandkit';
import type { AiCommand, AiConfig } from 'commandkit/ai';
import {
  ChannelType,
  GuildChannelCreateOptions,
  PermissionsBitField,
  OverwriteData,
} from 'discord.js';
import { z } from 'zod';

export const command: CommandData = {
  name: 'channel',
  description: 'Manage channels in the server',
};

const channelConfig = z.object({
  name: z.string().trim().min(1).max(100).describe('The name of the channel'),
  type: z.enum(['text', 'voice']).describe('The type of channel to create'),
  topic: z.string().trim().optional().describe('The topic for text channels'),
  user_limit: z
    .number()
    .int()
    .min(0)
    .max(99)
    .optional()
    .describe('User limit for voice channels'),
  nsfw: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether the channel is NSFW'),
  private: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether the channel is private'),
  parent: z
    .string()
    .optional()
    .describe('The ID of the category to create the channel in'),
});

export const aiConfig = {
  inputSchema: z.object({
    channels: z
      .array(channelConfig)
      .min(1)
      .max(5)
      .describe('Array of channels to create'),
  }),
} satisfies AiConfig;

export const message: MessageCommand = async (ctx) => {
  await ctx.message.reply('This command can only be used via AI');
};

export const ai: AiCommand<typeof aiConfig> = async (ctx) => {
  if (!ctx.message.inGuild()) {
    return {
      error: 'Channel management can only be used in a server',
    };
  }

  const hasPermission = ctx.message.channel
    .permissionsFor(ctx.message.client.user!)
    ?.has([
      PermissionsBitField.Flags.ManageChannels,
      PermissionsBitField.Flags.ViewChannel,
    ]);

  if (!hasPermission) {
    return {
      error: 'Bot does not have the required permissions to manage channels',
    };
  }

  const { channels } = ctx.ai.params;
  const createdChannels = [];

  for (const channel of channels) {
    try {
      const permissionOverwrites: OverwriteData[] = channel.private
        ? [
            {
              id: ctx.message.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: ctx.message.author.id,
              allow: [PermissionsBitField.Flags.ViewChannel],
            },
          ]
        : [];

      const channelOptions: GuildChannelCreateOptions = {
        name: channel.name,
        type:
          channel.type === 'text'
            ? ChannelType.GuildText
            : ChannelType.GuildVoice,
        topic: channel.topic,
        nsfw: channel.nsfw,
        userLimit: channel.user_limit,
        parent: channel.parent,
        permissionOverwrites,
      };

      const newChannel =
        await ctx.message.guild.channels.create(channelOptions);
      createdChannels.push(newChannel);
    } catch (err) {
      const error = err as Error;
      return {
        error: `Failed to create channel ${channel.name}: ${error.message}`,
      };
    }
  }

  return {
    content: `Successfully created ${
      createdChannels.length
    } channel(s): ${createdChannels.map((c) => c.toString()).join(', ')}`,
  };
};
