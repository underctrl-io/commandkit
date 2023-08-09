import { Client } from 'discord.js';

export interface EventHandlerOptions {
    client: Client;
    eventsPath: string;
}

export interface EventHandlerData extends EventHandlerOptions {
    events: { name: string; functions: Function[] }[];
}
