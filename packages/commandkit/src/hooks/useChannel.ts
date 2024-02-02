import type { TextBasedChannel } from 'discord.js';
import { getContext, prepareHookInvocationError } from './common';

export function useChannel(): TextBasedChannel | null {
  const data = getContext().getStore();

  if (!data) throw prepareHookInvocationError('useChannel');

  return data.interaction.channel;
}
