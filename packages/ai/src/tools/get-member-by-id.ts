import { z } from 'zod';
import { createTool } from './common';
import { Logger } from 'commandkit';

export const getMemberById = createTool({
  description:
    'Get a member by their ID. This tool can only be used in a guild.',
  name: 'getMemberById',
  inputSchema: z.object({
    memberId: z.string().describe('The ID of the member to retrieve.'),
  }),
  async execute(ctx, params) {
    try {
      const { client, message } = ctx;
      if (!message.inGuild()) {
        return {
          error: 'This tool can only be used in a guild',
        };
      }

      const member = await message.guild?.members.fetch(params.memberId);

      return {
        id: member.id,
        user: member.user.toJSON(),
        roles: member.roles.cache.map((role) => role.name),
        joinedAt: member.joinedAt?.toLocaleString(),
        isBoosting: !!member.premiumSince,
        voiceChannel: member.voice.channel?.name,
        voiceChannelId: member.voice.channel?.id,
        permissions: member.permissions.toArray().join(', '),
        nickname: member.nickname,
        name: member.user.username,
        displayName: member.displayName,
        avatar: member.user.displayAvatarURL(),
        isBot: member.user.bot,
        presence: member.presence?.status ?? 'unknown',
        isDeafened: member.voice.deaf ?? 'Not in VC',
        isMuted: member.voice.mute ?? 'Not in VC',
        isMe: member.id === message.author.id,
      };
    } catch (e) {
      Logger.error(e);

      return {
        error: 'Could not fetch the user',
      };
    }
  },
});
