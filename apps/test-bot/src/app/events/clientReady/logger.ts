import { Logger } from 'commandkit';
import { Client } from 'discord.js';

export default function ReadyEvent(client: Client<true>) {
  Logger.log(`Successfully logged in as ${client.user?.tag}`);
}
