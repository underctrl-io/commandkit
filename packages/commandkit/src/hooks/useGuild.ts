import type { Guild } from 'discord.js';
import { getContext, prepareHookInvocationError } from './common';

export function useGuild(): Guild | null {
  const data = getContext().getStore();

  if (!data) throw prepareHookInvocationError('useGuild');

  return data.interaction.guild;
}
