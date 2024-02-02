import { getContext, prepareHookInvocationError } from './common';

export function useCommandData() {
  const data = getContext().getStore();

  if (!data) throw prepareHookInvocationError('useCommandData');

  return data.command;
}
