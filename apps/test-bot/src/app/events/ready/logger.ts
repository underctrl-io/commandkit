import { Client } from 'discord.js';

export default function ReadyEvent(client: Client<true>) {
  console.log(`Successfully logged in as ${client.user?.tag}`);
}
