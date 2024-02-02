import { Client } from 'discord.js';
import { getConfig } from '../config';

let discord_client: Client;

/**
 * @internal
 */
export function getClient() {
  return discord_client;
}

/**
 * Fetches the client instance. If the client instance is not initialized, an error will be thrown.
 */
export function client<T extends boolean = boolean>() {
  if (!discord_client) {
    throw new Error(
      'Client was not initialized. Make sure to run "commandkit dev" to bootstrap the client.',
    );
  }

  return discord_client as Client<T>;
}

export function createClient() {
  const config = getConfig();

  discord_client = new Client(config.clientOptions);

  return discord_client;
}
