import { Client } from 'discord.js';
import { CommandKit } from 'commandkit';

/**
 *
 * @param {Client<true>} c
 * @param {Client} client
 * @param {CommandKit} handler
 */
export default function (c, client, handler) {
    console.log(`${c.user.username} is online.`);
}
