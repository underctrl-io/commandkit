import type {
  CacheType,
  Client,
  ClientEvents,
  Interaction,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import type { CommandKit } from './commandkit';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Options for instantiating a CommandKit handler.
 */
export interface CommandKitOptions {
  /**
   * The Discord.js client object to use with CommandKit.
   */
  client?: Client;
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

/**
 * Represents a command that can be executed by CommandKit.
 */
export type CommandData = Prettify<
  Omit<RESTPostAPIApplicationCommandsJSONBody, 'description'> & {
    description?: string;
    guilds?: string[];
    aliases?: string[];
  }
>;

/**
 * Represents an event handler for a specific event.
 */
export type EventHandler<K extends keyof ClientEvents> = (
  ...args: ClientEvents[K]
) => void | Promise<void>;
