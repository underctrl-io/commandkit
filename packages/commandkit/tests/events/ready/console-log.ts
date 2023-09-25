import type { Client } from 'discord.js';
import type { CommandKit } from '../../../src';

export default function (c: Client<true>, client, handler: CommandKit) {
    console.log(handler.commands);
    console.log(`${c.user.username} is online.`);
}
