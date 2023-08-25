import { CommandHandlerData, CommandHandlerOptions } from "./typings";
import { getFilePaths } from "../../utils/get-paths";
import builtInValidations from "./validations";
import registerCommands from "./functions/registerCommands";
import handleCommands from "./functions/handleCommands";

export class CommandHandler {
    _data: CommandHandlerData;

    constructor({ ...options }: CommandHandlerOptions) {
        this._data = {
            ...options,
            builtInValidations: [],
            commands: [],
        };
    }

    async init() {
        await this.#buildCommands();
        this.#buildValidations();
        await this.#registerCommands();
        this.#handleCommands();
    }

    async #buildCommands() {
        const commandFilePaths = getFilePaths(this._data.commandsPath, true).filter(
            (path) => path.endsWith(".js") || path.endsWith(".ts")
        );

        for (const commandFilePath of commandFilePaths) {
            let commandObj = await import(commandFilePath);
            const compactFilePath = commandFilePath.split(process.cwd())[1] || commandFilePath;

            if (commandObj.default) commandObj = commandObj.default;

            if (!commandObj.data) {
                console.log(`⏩ Ignoring: Command ${compactFilePath} does not export "data".`);
                continue;
            }

            if (!commandObj.run) {
                console.log(`⏩ Ignoring: Command ${compactFilePath} does not export "run".`);
                continue;
            }

            this._data.commands.push(commandObj);
        }
    }

    #buildValidations() {
        for (const validationFunction of builtInValidations) {
            this._data.builtInValidations.push(validationFunction);
        }
    }

    async #registerCommands() {
        await registerCommands(this);
    }

    #handleCommands() {
        handleCommands(this);
    }

    get commands() {
        return this._data.commands;
    }
}
