import type {
  LoadedCommand,
  CommandKit,
  ParsedEvent,
  CommandKitEnvironment,
  EventWorkerContext,
} from './dist/index.js';
import type { Client, Collection } from 'discord.js';

export function useAnyEnvironment(): CommandKitEnvironment | EventWorkerContext;

export function useClient<Ready extends boolean = boolean>(): Client<Ready>;

export function useCommandKit(): CommandKit;

export function useCommand(): LoadedCommand;

export function useEvent(): ParsedEvent;

export function useStore<K = any, V = any>(): Collection<K, V>;
