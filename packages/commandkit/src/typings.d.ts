import { Client, Interaction } from 'discord.js';
import { CommandData, CommandKit, CommandOptions } from './index';

export interface CommandKitOptions {
    client: Client;
    commandsPath?: string;
    eventsPath?: string;
    validationsPath?: string;
    devGuildIds?: string[];
    devUserIds?: string[];
    devRoleIds?: string[];
    skipBuiltInValidations?: boolean;
}

export interface CommandKitData extends CommandKitOptions {
    commands: Array<SlashCommandObject | ContextCommandObject>;
}

export interface SlashCommandObject {
    data: CommandData;
    options?: CommandOptions;
    run: ({}: { interaction: Interaction; client: Client; handler: CommandKit }) => void;
}

export interface ContextCommandObject {
    data: CommandData;
    options?: CommandOptions;
    run: ({}: { interaction: Interaction; client: Client; handler: CommandKit }) => void;
}
