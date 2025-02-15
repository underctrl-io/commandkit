/**
 * @param {import('discord.js').Client<true>} client
 */
module.exports = (client) => {
  console.log(`Logged in as ${client.user.username}!`);
};
