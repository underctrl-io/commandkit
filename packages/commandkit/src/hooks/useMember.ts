import type { APIInteractionGuildMember, GuildMember } from 'discord.js';
import { getContext, prepareHookInvocationError } from './common';

export function useMember(): GuildMember | APIInteractionGuildMember | null {
  const data = getContext().getStore();

  if (!data) throw prepareHookInvocationError('useMember');

  return data.interaction.member;
}
