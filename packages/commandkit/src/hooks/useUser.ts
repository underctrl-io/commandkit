import type { User } from 'discord.js';
import { getContext, prepareHookInvocationError } from './common';

export function useUser(): User {
  const data = getContext().getStore();

  if (!data) throw prepareHookInvocationError('useUser');

  return data.interaction.user;
}
