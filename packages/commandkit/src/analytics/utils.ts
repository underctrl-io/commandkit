import { getEventWorkerContext } from '../app/events/EventWorkerContext';
import { getContext } from '../context/async-context';
import { DO_NOT_TRACK_KEY } from './constants';

function getVariableStore() {
  const ctx = getContext();

  if (!ctx) {
    try {
      const eventContext = getEventWorkerContext();
      return eventContext.variables;
    } catch {
      return null;
    }
  }

  return ctx.variables;
}

export function getDoNotTrack() {
  const variables = getVariableStore();
  return variables?.get(DO_NOT_TRACK_KEY) === true;
}

export function noAnalytics() {
  const variables = getVariableStore();

  if (!variables) {
    throw new Error('noAnalytics may only be used inside commandkit context');
  }

  variables.set(DO_NOT_TRACK_KEY, true);
}
