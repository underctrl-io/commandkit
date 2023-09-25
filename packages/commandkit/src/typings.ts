// This types file is for development
// For exported types use ./types/index.ts

import type { Client, Interaction } from 'discord.js';
import type { CommandData, CommandKit, CommandOptions } from './index';
import type { CommandHandler, EventHandler, ValidationHandler } from './handlers';

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
    commandHandler?: CommandHandler;
    eventHandler?: EventHandler;
    validationHandler?: ValidationHandler;
}

export interface CommandFileObject {
    data: CommandData;
    options?: CommandOptions;
    run: ({}: { interaction: Interaction; client: Client; handler: CommandKit }) => void;
    filePath: string;
    category?: string;
    [key: string]: any;
}

export type ReloadOptions = { type?: 'dev' | 'global' };
