import { locale } from '@commandkit/i18n';
import type { Message } from 'discord.js';

export default function (message: Message) {
  const { t } = locale(message.guild?.preferredLocale);
  if (!message.author.bot && message.content === 'hello') {
    message.reply(t('say-hi'));
  }
}
