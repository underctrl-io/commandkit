import { Logger } from 'commandkit/logger'

/**
 * @param {import('discord.js').Client<true>} client
 */
export default function log(client) {
  Logger.success(`Logged in as ${client.user.username}!`);
}
