import {
  CacheType,
  Client,
  Interaction,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import type { CommandKit } from './CommandKit';

import { CacheProvider } from './cache/CacheProvider';

/**
 * Options for instantiating a CommandKit handler.
 */
export interface CommandKitOptions {
  /**
   * The Discord.js client object to use with CommandKit.
   */
  client: Client;
  /**
   * The cache provider to use with CommandKit. Defaults to MemoryCache provider.
   * Set this to `null` to not use any cache provider.
   */
  cacheProvider?: CacheProvider | null;
}

/**
 * Represents a command context.
 */
export interface CommandContext<
  T extends Interaction,
  Cached extends CacheType,
> {
  /**
   * The interaction that triggered this command.
   */
  interaction: Interaction<CacheType>;
  /**
   * The client that instantiated this command.
   */
  client: Client;
  /**
   * The command data.
   */
  handler: CommandKit;
}

export type CommandData = RESTPostAPIApplicationCommandsJSONBody & {
  guilds?: string[];
};
