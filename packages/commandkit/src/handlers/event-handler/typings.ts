import type { Client } from 'discord.js';
import type { CommandKit } from '../../CommandKit';

export interface EventHandlerOptions {
    client: Client;
    eventsPath: string;
    commandKitInstance: CommandKit;
}

export interface EventHandlerData extends EventHandlerOptions {
    events: { name: string; functions: Function[] }[];
}
