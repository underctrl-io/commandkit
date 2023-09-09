import { CommandHandler, EventHandler, ValidationHandler } from './handlers';
import { CommandKitData, CommandKitOptions } from './typings';
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

    /**
     * Returns all the commands that CommandKit is handling.
     *
     * @returns An array of command objects
     */
    get commands(): CommandObject[] {
        const commands = this.#data.commands.map((cmd) => {
            const { run, ...command } = cmd;
            return command;
        });

        return commands;
    }
}
