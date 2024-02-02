import type { Client } from 'discord.js';
import type { CommandKit } from '../../CommandKit';

/**
 * Event handler options.
 */
export interface EventHandlerOptions {
  client: Client;
  eventsPath: string;
  commandKitInstance: CommandKit;
}

/**
 * Private event handler data.
 */
export interface EventHandlerData extends EventHandlerOptions {
  events: { name: string; functions: Function[] }[];
}
