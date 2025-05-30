import { CommandKitEventsChannel } from './dist/events/CommandKitEventsChannel';

/**
 * @returns the events channel of the current CommandKit instance.
 * @throws error if CommandKit is not initialized.
 */
export function useEvents(): CommandKitEventsChannel;
