import type { CommandKitData, CommandKitOptions, ReloadOptions } from './typings';
import type { CommandObject } from './types';

import { CommandHandler, EventHandler, ValidationHandler } from './handlers';

import colors from './utils/colors';

/**
 * The IPC signals that CommandKit uses to communicate with the parent process.
 */
export const enum CommandKitSignalType {
    /**
     * Reload all commands.
     */
    ReloadCommands = '__command$kit__reload_commands__',
    /**
     * Reload all events.
     */
    ReloadEvents = '__command$kit__reload_events__',
    /**
     * Reload all validations.
     */
    ReloadValidations = '__command$kit__reload_validations__',
    /**
     * Get the commands path.
     */
    GetCommandsPath = '__command$kit__get_commands_path__',
    /**
     * Get the events path.
     */
    GetEventsPath = '__command$kit__get_events_path__',
    /**
     * Get the validations path.
     */
    GetValidationsPath = '__command$kit__get_validations_path__',
}

export class CommandKit {
    #data: CommandKitData;

    /**
     * Create a new command and event handler with CommandKit.
     *
     * @param options - The default CommandKit configuration.
     * @see {@link https://commandkit.js.org/docs/commandkit-setup}
     */
    constructor(options: CommandKitOptions) {
        if (!options.client) {
            throw new Error(colors.red('"client" is required when instantiating CommandKit.'));
        }

        if (options.validationsPath && !options.commandsPath) {
            throw new Error(
                colors.red('"commandsPath" is required when "validationsPath" is set.'),
            );
        }

        this.#data = options;

        this.#init();
    }

    /**
     * (Private) Initialize CommandKit.
     */
    async #init() {
        // <!-- Setup event handler -->
        if (this.#data.eventsPath) {
            const eventHandler = new EventHandler({
                client: this.#data.client,
                eventsPath: this.#data.eventsPath,
                commandKitInstance: this,
            });

            await eventHandler.init();

            this.#data.eventHandler = eventHandler;
        }

        // <!-- Setup validation handler -->
        if (this.#data.validationsPath) {
            const validationHandler = new ValidationHandler({
                validationsPath: this.#data.validationsPath,
            });

            await validationHandler.init();

            this.#data.validationHandler = validationHandler;
        }

        // <!-- Setup command handler -->
        if (this.#data.commandsPath) {
            const commandHandler = new CommandHandler({
                client: this.#data.client,
                commandsPath: this.#data.commandsPath,
                devGuildIds: this.#data.devGuildIds || [],
                devUserIds: this.#data.devUserIds || [],
                devRoleIds: this.#data.devRoleIds || [],
                validationHandler: this.#data.validationHandler,
                skipBuiltInValidations: this.#data.skipBuiltInValidations || false,
                commandkitInstance: this,
                bulkRegister: this.#data.bulkRegister || false,
            });

            await commandHandler.init();

            this.#data.commandHandler = commandHandler;
        }

        // <!-- Register message handlers from parent to trigger reload -->
        // skip if not in a child process
        if (process.send) {
            process.on('message', async (message) => {
                switch (message) {
                    case CommandKitSignalType.ReloadCommands:
                        await this.reloadCommands();
                        break;
                    case CommandKitSignalType.ReloadEvents:
                        await this.reloadEvents();
                        break;
                    case CommandKitSignalType.ReloadValidations:
                        await this.reloadValidations();
                        break;
                    case CommandKitSignalType.GetCommandsPath:
                        process.send!(message, this.commandsPath);
                        break;
                    case CommandKitSignalType.GetEventsPath:
                        process.send!(message, this.eventsPath);
                        break;
                    case CommandKitSignalType.GetValidationsPath:
                        process.send!(message, this.validationsPath);
                        break;
                    default:
                        break;
                }
            });
        }
    }

    /**
     * Updates application commands with the latest from "commandsPath".
     */
    async reloadCommands(type?: ReloadOptions) {
        if (!this.#data.commandHandler) return;
        await this.#data.commandHandler.reloadCommands(type);
    }

    /**
     * Updates application events with the latest from "eventsPath".
     */
    async reloadEvents() {
        if (!this.#data.eventHandler) return;
        await this.#data.eventHandler.reloadEvents(this.#data.commandHandler);
    }

    /**
     * Updates application command validations with the latest from "validationsPath".
     */
    async reloadValidations() {
        if (!this.#data.validationHandler) return;
        await this.#data.validationHandler.reloadValidations();
    }

    /**
     * @returns An array of objects of all the commands that CommandKit is handling.
     */
    get commands(): CommandObject[] {
        if (!this.#data.commandHandler) {
            return [];
        }

        const commands = this.#data.commandHandler.commands.map((cmd) => {
            const { run, autocomplete, ...command } = cmd;
            return command;
        });

        return commands;
    }

    /**
     * @returns The path to the commands folder which was set when instantiating CommandKit.
     */
    get commandsPath(): string | undefined {
        return this.#data.commandsPath;
    }

    /**
     * @returns The path to the events folder which was set when instantiating CommandKit.
     */
    get eventsPath(): string | undefined {
        return this.#data.eventsPath;
    }

    /**
     * @returns The path to the validations folder which was set when instantiating CommandKit.
     */
    get validationsPath(): string | undefined {
        return this.#data.validationsPath;
    }

    /**
     * @returns An array of all the developer user IDs which was set when instantiating CommandKit.
     */
    get devUserIds(): string[] {
        return this.#data.devUserIds || [];
    }

    /**
     * @returns An array of all the developer guild IDs which was set when instantiating CommandKit.
     */
    get devGuildIds(): string[] {
        return this.#data.devGuildIds || [];
    }

    /**
     * @returns An array of all the developer role IDs which was set when instantiating CommandKit.
     */
    get devRoleIds(): string[] {
        return this.#data.devRoleIds || [];
    }
}
