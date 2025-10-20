import { flag } from 'commandkit/flag';
import { Events } from 'discord.js';
import murmurhash from 'murmurhash';

export const determineLevelUpMessageType = flag({
  key: 'level-up-message-type',
  description:
    'The type of level up message to send, either plain text or image',
  identify(ctx) {
    const [message] = ctx.event?.argumentsAs(Events.MessageCreate) ?? [];

    return { id: message?.guildId ?? null };
  },
  decide({ entities }) {
    const guildId = entities.id;
    if (!guildId) return 'plain';

    const hash = murmurhash.v3(guildId);
    const bucket = hash % 100;

    // 50% chance of plain text, 50% chance of image, based on guild id
    if (bucket < 50) return 'plain';
    return 'image';
  },
});
