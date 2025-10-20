import { determineLevelUpMessageType } from '@/feature-flags/level-up-message';
import { Message } from 'discord.js';
import { plainResponse } from './responses/_text.response';
import { imageResponse } from './responses/_image.response';

// this is a custom event that is triggered when a user levels up
export default async function onLevelUp(
  message: Message<true>,
  newLevel: number
) {
  const levelUpMessageType = await determineLevelUpMessageType();

  if (levelUpMessageType === 'plain') {
    return plainResponse(message, newLevel);
  }

  return imageResponse(message, newLevel);
}
