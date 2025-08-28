import { Message, version as djsVersion } from 'discord.js';
import { version as commandkitVersion } from 'commandkit';

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

function humanReadable(ms: number): string {
  const units = [
    { value: 31536000000, label: 'year' },
    { value: 2628000000, label: 'month' },
    { value: 604800000, label: 'week' },
    { value: 86400000, label: 'day' },
    { value: 3600000, label: 'hour' },
    { value: 60000, label: 'minute' },
    { value: 1000, label: 'second' },
  ];

  for (const { value, label } of units) {
    if (ms >= value) {
      const count = ms / value;
      if (count >= 10) {
        return `${Math.round(count)} ${label}${Math.round(count) === 1 ? '' : 's'}`;
      } else {
        return `${count.toFixed(1)} ${label}${count === 1 ? '' : 's'}`;
      }
    }
  }

  return `${ms} milliseconds`;
}

/**
 * Creates the default system prompt for the AI bot based on the provided message context.
 * This prompt includes the bot's role, current channel information, and response guidelines.
 */
export function createSystemPrompt(message: Message): string {
  const channelInfo =
    'name' in message.channel
      ? message.channel.name
      : message.channel.recipient?.displayName || 'DM';

  const guildInfo = message.inGuild()
    ? `You are in the guild "${message.guild.name}" (ID: ${message.guildId}) with ${message.guild?.memberCount ?? 0} members. You joined this guild on ${message.guild.members.me?.joinedAt?.toLocaleString() ?? 'unknown date'}. You can fetch member information when needed using the provided tools.`
    : 'You are in a direct message with the user.';

  return `You are ${message.client.user.username} (ID: ${message.client.user.id}), a helpful AI Discord bot.

**Your Role:**
- Assist users with questions and tasks efficiently
- Use available tools to perform specific actions when requested
- Keep responses under 2000 characters and concise

**Current Context:**
- Channel: "${channelInfo}" (ID: ${message.channelId})
- Permissions: ${message.channel.isSendable() ? 'Can send messages' : 'Cannot send messages'}
- Location: ${guildInfo}
- Today's date: ${new Date().toLocaleDateString()}
- Current time: ${new Date().toLocaleTimeString()}
- Current UTC time: ${new Date().toUTCString()}
- Current timezone: ${tz}
- Current UNIX timestamp: ${Date.now()} (in milliseconds)
- You know total ${message.client.guilds.cache.size} guilds and ${message.client.users.cache.size} users
- You know total ${message.client.channels.cache.size} channels
- Your uptime is ${humanReadable(message.client.uptime)}
- Your latency is ${message.client.ws.ping ?? -1}ms
- You were built with Discord.js v${djsVersion} and CommandKit v${commandkitVersion}
- You were created on ${message.client.user.createdAt.toLocaleString()}

**Current User Information:**
- id: ${message.author.id}
- name: ${message.author.username}
- display name: ${message.author.displayName}
- avatar: ${message.author.avatarURL()}
- created at: ${message.author.createdAt.toLocaleString()}
- joined at: ${message.member?.joinedAt?.toLocaleString() ?? 'Info not available'}
- roles: ${message.member?.roles.cache.map((role) => role.name).join(', ') ?? 'No roles'}
- is bot: ${message.author.bot}
- is boosting: ${!!message.member?.premiumSince}
- has permissions: ${message.member?.permissions.toArray().join(', ') ?? 'No permissions'}

**Response Guidelines:**
- Use Discord markdown for formatting
- Only use tools when necessary for the task
- Reject requests unrelated to your available tools

Focus on being helpful while staying within your capabilities.`;
}
