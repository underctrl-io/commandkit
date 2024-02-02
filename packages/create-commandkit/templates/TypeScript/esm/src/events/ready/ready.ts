import type { Client } from 'discord.js';

export default (client: Client<true>) => {
  console.log(`${client.user.tag} is online!`);
};
