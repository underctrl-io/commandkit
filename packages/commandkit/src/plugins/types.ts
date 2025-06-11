import { ParsedEvent } from '../app/router';
import type { CompilerPlugin } from './CompilerPlugin';
import type { RuntimePlugin } from './RuntimePlugin';

/**
 * Represents a CommandKit plugin that can be either a runtime or compiler plugin.
 */
export type CommandKitPlugin = RuntimePlugin | CompilerPlugin;
/**
 * @private
 */
export type MaybeFalsey<T> = T | false | null | undefined;

/**
 * Represents an event dispatched to the plugins.
 */
export interface CommandKitEventDispatch {
  /**
   * The name of the event.
   */
  name: string;
  /**
   * The arguments passed to the event.
   */
  args: unknown[];
  /**
   * The namespace of the event, if any.
   */
  namespace: string | null;
  /**
   * If this event runs only once, it will be set to true.
   */
  once: boolean;
  /**
   * The additional metadata associated with the event.
   */
  metadata: ParsedEvent;
  /**
   * Captures the owner of the event, preventing other plugins from handling it.
   */
  accept(): void;
}

/**
 * Represents a template handler function that can be used to handle templates using `commandkit create` command.
 * @param args - The arguments passed to the template handler.
 */
export type TemplateHandler = (args: string[]) => Promise<void> | void;
