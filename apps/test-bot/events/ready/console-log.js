const { Client } = require('discord.js');
const { CommandKit } = require('commandkit');

/**
 *
 * @param {Client<true>} c
 * @param {Client} client
 * @param {CommandKit} handler
 */
module.exports = (c, client, handler) => {
    console.log(handler.commands);
    console.log(`${c.user.username} is online.`);
};
