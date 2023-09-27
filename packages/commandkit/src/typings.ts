// This types file is for development
// For exported types use ./types/index.ts

import type { Client, Interaction } from 'discord.js';
import type { CommandData, CommandKit, CommandOptions } from './index';
import type { CommandHandler, EventHandler, ValidationHandler } from './handlers';

export interface CommandKitOptions {
    /**
     * The Discord.js client object to use with CommandKit.
     */
    client: Client;

    /**
     * The path to your commands directory.
     */
    commandsPath?: string;

    /**
     * The path to your events directory.
     */
    eventsPath?: string;

    /**
     * The path to the validations directory.
     */
    validationsPath?: string;

    /**
     * List of development guild IDs to restrict devOnly commands to.
     */
    devGuildIds?: string[];

    /**
     * List of developer user IDs to restrict devOnly commands to.
     */
    devUserIds?: string[];

    /**
     * List of developer role IDs to restrict devOnly commands to.
     */
    devRoleIds?: string[];

    /**
     * Skip CommandKit's built-in validations (for devOnly commands).
     */
    skipBuiltInValidations?: boolean;

    /**
     * Uses discordjs/rest to register application commands.
     * @experimental
     */
    useRest?: boolean;
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
    category: string | null;
    [key: string]: any;
}

export type ReloadType = 'dev' | 'global';
