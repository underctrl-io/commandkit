import { Logger } from 'commandkit/logger';

/**
 * @param {import('discord.js').Client<true>} client
 */
export default function log(client) {
  Logger.info(`Logged in as ${client.user.username}!`);
}
