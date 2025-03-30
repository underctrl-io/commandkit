/**
 * @param {import('discord.js').Client<true>} client
 */
export default function log(client) {
  console.log(`Logged in as ${client.user.username}!`);
}
