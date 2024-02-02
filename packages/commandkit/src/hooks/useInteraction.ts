import { getContext, prepareHookInvocationError } from './common';
import { CommandKitInteraction } from '../handlers/command-handler/typings';

export function useInteraction<
  T extends CommandKitInteraction = CommandKitInteraction,
>(): T {
  const data = getContext().getStore();

  if (!data) throw prepareHookInvocationError('useInteraction');

  return data.interaction as T;
}
