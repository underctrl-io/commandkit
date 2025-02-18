import type { CompilerPlugin } from './CompilerPlugin';
import type { RuntimePlugin } from './RuntimePlugin';

export type CommandKitPlugin = RuntimePlugin | CompilerPlugin;
export type MaybeFalsey<T> = T | false | null | undefined;
