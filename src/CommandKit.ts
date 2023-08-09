import { CommandHandler, EventHandler, ValidationHandler } from './handlers';
import { CommandKitData, CommandKitOptions } from '../typings';

export class CommandKit {
    private _data: CommandKitData;

    constructor({ ...options }: CommandKitOptions) {
        if (!options.client) {
            throw new Error('"client" is required when instantiating CommandKit.');
        }

        if (options.validationsPath && !options.commandsPath) {
            throw new Error('"commandsPath" is required when "validationsPath" is set.');
        }

        this._data = {
            ...options,
            commands: [],
        };

        this._init();
    }

    private _init() {
        // Event handler
        if (this._data.eventsPath) {
            new EventHandler({
                client: this._data.client,
                eventsPath: this._data.eventsPath,
            });
        }

        // Validation handler
        let validationFunctions: Function[] = [];

        if (this._data.validationsPath) {
            const validationHandler = new ValidationHandler({
                validationsPath: this._data.validationsPath,
            });

            validationHandler.getValidations().forEach((v) => validationFunctions.push(v));
        }

        // Command handler
        if (this._data.commandsPath) {
            const commandHandler = new CommandHandler({
                client: this._data.client,
                commandsPath: this._data.commandsPath,
                devGuildIds: this._data.devGuildIds || [],
                devUserIds: this._data.devUserIds || [],
                devRoleIds: this._data.devRoleIds || [],
                customValidations: validationFunctions,
                skipBuiltInValidations: this._data.skipBuiltInValidations || false,
            });

            this._data.commands = commandHandler.getCommands();
        }
    }

    get commands() {
        return this._data.commands.map((cmd) => {
            const { run, ...command } = cmd;
            return command;
        });
    }
}
