import { Client } from 'discord.js';
import { ContextCommandObject, SlashCommandObject } from '../../../typings';

export interface CommandHandlerOptions {
    client: Client;
    commandsPath: string;
    devGuildIds: string[];
    devUserIds: string[];
    validations: Function[];
}

export interface CommandHandlerData extends CommandHandlerOptions {
    commands: Array<SlashCommandObject | ContextCommandObject>;
}
