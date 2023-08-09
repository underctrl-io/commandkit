import { BuiltInValidation, CommandHandlerData, CommandHandlerOptions } from './typings';
import { ContextCommandObject, SlashCommandObject } from '../../../typings';
import { getFilePaths } from '../../utils/get-paths';
import registerCommands from './functions/registerCommands';
import handleCommands from './functions/handleCommands';
import path from 'path';

export class CommandHandler {
    _data: CommandHandlerData;

    constructor({ ...options }: CommandHandlerOptions) {
        this._data = {
            ...options,
            builtInValidations: [],
            commands: [],
        };

        this._init();
    }

    _init() {
        this._buildCommands();
        this._buildValidations();
        this._registerCommands();
        this._handleCommands();
    }

    _buildCommands() {
        const commandFilePaths = getFilePaths(this._data.commandsPath, true).filter(
            (path) => path.endsWith('.js') || path.endsWith('.ts')
        );

        for (const commandFilePath of commandFilePaths) {
            const commandObj: SlashCommandObject | ContextCommandObject = require(commandFilePath);

            if (!commandObj.data) {
                console.log(`⏩ Ignoring: Command ${commandFilePath} does not export "data".`);
                continue;
            }

            if (!commandObj.run) {
                console.log(`⏩ Ignoring: Command ${commandFilePath} does not export "run".`);
                continue;
            }

            this._data.commands.push(commandObj);
        }
    }

    _buildValidations() {
        const validationFilePaths = getFilePaths(path.join(__dirname, 'validations'), true).filter(
            (path) => path.endsWith('.js')
        );

        for (const validationFilePath of validationFilePaths) {
            const validationFunction: Function = require(validationFilePath);

            if (typeof validationFunction !== 'function') {
                continue;
            }

            this._data.builtInValidations.push(validationFunction as BuiltInValidation);
        }
    }

    _registerCommands() {
        registerCommands(this);
    }

    _handleCommands() {
        handleCommands(this);
    }

    getCommands() {
        return this._data.commands;
    }
}
