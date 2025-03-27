import type { Typing } from 'discord.js';

export default function MessageTypingEvent(event: Typing) {
  console.log(`${event.user.username} is typing in ${event.channel.id}`);
}
