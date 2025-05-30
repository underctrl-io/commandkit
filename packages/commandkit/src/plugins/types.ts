import { ParsedEvent } from '../app/router';
import type { CompilerPlugin } from './CompilerPlugin';
import type { RuntimePlugin } from './RuntimePlugin';

export type CommandKitPlugin = RuntimePlugin | CompilerPlugin;
export type MaybeFalsey<T> = T | false | null | undefined;

export interface CommandKitEventDispatch {
  name: string;
  args: unknown[];
  namespace: string | null;
  once: boolean;
  metadata: ParsedEvent;
  accept(): void;
}

export type TemplateHandler = (args: string[]) => Promise<void> | void;
