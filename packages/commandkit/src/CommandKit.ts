import { CommandHandler, EventHandler, ValidationHandler } from './handlers';
import { CommandKitData, CommandKitOptions } from './dev-types';
import { CommandObject } from './types';
import colors from 'colors/safe';

export class CommandKit {
    #data: CommandKitData;

    constructor({ ...options }: CommandKitOptions) {
        if (!options.client) {
            throw new Error(colors.red('"client" is required when instantiating CommandKit.'));
        }

        if (options.validationsPath && !options.commandsPath) {
            throw new Error(
                colors.red('"commandsPath" is required when "validationsPath" is set.'),
            );
        }

        this.#data = {
            ...options,
            commands: [],
        };

        this.#init();
    }

    async #init() {
        if (this.#data.eventsPath) {
            const eventHandler = new EventHandler({
                client: this.#data.client,
                eventsPath: this.#data.eventsPath,
                commandKitInstance: this,
            });

            await eventHandler.init();
        }

        let validationFunctions: Function[] = [];
        if (this.#data.validationsPath) {
            const validationHandler = new ValidationHandler({
                validationsPath: this.#data.validationsPath,
            });

            await validationHandler.init();
            validationHandler.validations.forEach((v) => validationFunctions.push(v));
        }

        if (this.#data.commandsPath) {
            const commandHandler = new CommandHandler({
                client: this.#data.client,
                commandsPath: this.#data.commandsPath,
                devGuildIds: this.#data.devGuildIds || [],
                devUserIds: this.#data.devUserIds || [],
                devRoleIds: this.#data.devRoleIds || [],
                customValidations: validationFunctions,
                skipBuiltInValidations: this.#data.skipBuiltInValidations || false,
                commandKitInstance: this,
            });

            await commandHandler.init();
            this.#data.commands = commandHandler.commands;
        }
    }

    /** @returns An array of objects of all the commands that CommandKit is handling. */
    get commands(): CommandObject[] {
        const commands = this.#data.commands.map((cmd) => {
            const { run, ...command } = cmd;
            return command;
        });

        return commands;
    }

    /** @returns The path to the commands folder which was set when instantiating CommandKit. */
    get commandsPath(): string | undefined {
        return this.#data.commandsPath;
    }

    /** @returns The path to the events folder which was set when instantiating CommandKit. */
    get eventsPath(): string | undefined {
        return this.#data.eventsPath;
    }

    /** @returns The path to the validations folder which was set when instantiating CommandKit. */
    get validationsPath(): string | undefined {
        return this.#data.validationsPath;
    }

    /** @returns An array of all the developer user IDs which was set when instantiating CommandKit. */
    get devUserIds(): string[] {
        return this.#data.devUserIds || [];
    }

    /** @returns An array of all the developer guild IDs which was set when instantiating CommandKit. */
    get devGuildIds(): string[] {
        return this.#data.devGuildIds || [];
    }

    /** @returns An array of all the developer role IDs which was set when instantiating CommandKit. */
    get devRoleIds(): string[] {
        return this.#data.devRoleIds || [];
    }

    reloadCommands({ type }: { type?: 'dev' | 'global' }) {
        if (type === 'dev') {
            // register dev
        } else if (type === 'global') {
            // register global
        } else {
            // register dev and global
        }
    }
}
