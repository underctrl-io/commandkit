import type { Message } from 'discord.js';

export default function (message: Message) {
  if (!message.author.bot && message.content === 'hello') {
    message.reply('hi!');
  }
}
