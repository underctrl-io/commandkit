import { Client } from 'discord.js';
import { CommandKit } from '../../CommandKit';

export interface EventHandlerOptions {
    client: Client;
    eventsPath: string;
    commandKitInstance: CommandKit;
}

export interface EventHandlerData extends EventHandlerOptions {
    events: { name: string; functions: Function[] }[];
}
