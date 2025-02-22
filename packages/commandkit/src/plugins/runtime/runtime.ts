import type { CommandKitPluginRuntime } from './CommandKitPluginRuntime';
import type { CompilerPluginRuntime } from './CompilerPluginRuntime';

export type CommonPluginRuntime =
  | CommandKitPluginRuntime
  | CompilerPluginRuntime;
