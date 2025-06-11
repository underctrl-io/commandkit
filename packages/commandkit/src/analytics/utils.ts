import { getEventWorkerContext } from '../app/events/EventWorkerContext';
import { getContext } from '../context/async-context';
import { DO_NOT_TRACK_KEY } from './constants';

/**
 * @private
 * @internal
 */
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

/**
 * @private
 * @internal
 */
export function getDoNotTrack() {
  const variables = getVariableStore();
  return variables?.get(DO_NOT_TRACK_KEY) === true;
}

/**
 * Signals commandkit to not track further analytics events within current context.
 * This is useful for scenarios where you want to disable analytics tracking
 * for a specific command or operation, such as during testing or when the user opts out.
 * @example import { noAnalytics } from 'commandkit/analytics';
 *
 * // inside commandkit context
 * noAnalytics();
 */
export function noAnalytics() {
  const variables = getVariableStore();

  if (!variables) {
    throw new Error('noAnalytics may only be used inside commandkit context');
  }

  variables.set(DO_NOT_TRACK_KEY, true);
}
