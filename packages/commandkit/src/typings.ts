// This types file is for development
// For exported types use ./types/index.ts

import type { AutocompleteInteraction, CacheType, Client, Interaction } from 'discord.js';
import type { CommandData, CommandKit, CommandOptions, ReloadType } from './index';
import type { CommandHandler, EventHandler, ValidationHandler } from './handlers';

/**
 * Options for instantiating a CommandKit handler.
 */
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
     * Bulk register application commands instead of one-by-one.
     */
    bulkRegister?: boolean;
}

/**
 * Private data for the CommandKit class.
 */
export interface CommandKitData extends CommandKitOptions {
    commandHandler?: CommandHandler;
    eventHandler?: EventHandler;
    validationHandler?: ValidationHandler;
}

/**
 * Represents a command context.
 */
export interface CommandContext<T extends Interaction, Cached extends CacheType> {
    /**
     * The interaction that triggered this command.
     */
    interaction: Interaction<CacheType>;
    /**
     * The client that instantiated this command.
     */
    client: Client;
    /**
     * The command data.
     */
    handler: CommandKit;
}

/**
 * Represents a command file.
 */
export interface CommandFileObject {
    data: CommandData;
    options?: CommandOptions;
    run: <Cached extends CacheType = CacheType>(
        ctx: CommandContext<Interaction, Cached>,
    ) => Awaited<void>;
    autocompleteRun?: <Cached extends CacheType = CacheType>(
        ctx: CommandContext<Interaction, Cached>,
    ) => Awaited<void>;
    filePath: string;
    category: string | null;
    [key: string]: any;
}

/**
 * A reload type for commands.
 */
export type ReloadOptions = 'dev' | 'global' | ReloadType;
