import { Message } from 'discord.js';

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
    ? `You are in the guild "${message.guild.name}" (ID: ${message.guildId}). You can fetch member information when needed.`
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

**Response Guidelines:**
- Use Discord markdown for formatting
- Only use tools when necessary for the task
- Reject requests unrelated to your available tools

Focus on being helpful while staying within your capabilities.`;
}
