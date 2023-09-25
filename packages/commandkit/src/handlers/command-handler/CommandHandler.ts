import type { CommandHandlerData, CommandHandlerOptions } from './typings';
import type { CommandFileObject, ReloadOptions } from '../../typings';
import { getFilePaths } from '../../utils/get-paths';
import { toFileURL } from '../../utils/resolve-file-url';

import registerCommands from './functions/registerCommands';
import builtInValidations from './validations';

import colors from 'colors/safe';

export class CommandHandler {
    #data: CommandHandlerData;

    constructor({ ...options }: CommandHandlerOptions) {
        this.#data = {
            ...options,
            builtInValidations: [],
            commands: [],
        };
    }

    async init() {
        await this.#buildCommands();

        this.#buildValidations();

        await registerCommands({
            client: this.#data.client,
            devGuildIds: this.#data.devGuildIds,
            commands: this.#data.commands,
        });

        this.#handleCommands();
    }

    async #buildCommands() {
        const allowedExtensions = /\.(js|mjs|cjs|ts)$/i;

        const commandFilePaths = getFilePaths(this.#data.commandsPath, true).filter((path) =>
            allowedExtensions.test(path),
        );

        for (const commandFilePath of commandFilePaths) {
            const modulePath = toFileURL(commandFilePath);

            let commandObj = await import(modulePath);

            const compactFilePath = commandFilePath.split(process.cwd())[1] || commandFilePath;

            if (commandObj.default) commandObj = commandObj.default;

            if (!commandObj.data) {
                console.log(
                    colors.yellow(
                        `⏩ Ignoring: Command ${compactFilePath} does not export "data".`,
                    ),
                );
                continue;
            }

            if (!commandObj.run) {
                console.log(
                    colors.yellow(`⏩ Ignoring: Command ${compactFilePath} does not export "run".`),
                );
                continue;
            }

            commandObj.filePath = commandFilePath;

            let commandCategory =
                commandFilePath
                    .split(this.#data.commandsPath)[1]
                    ?.replace(/\\\\|\\/g, '/')
                    .split('/')[1] || null;

            if (commandCategory && allowedExtensions.test(commandCategory)) {
                commandObj.category = null;
            } else {
                commandObj.category = commandCategory;
            }

            this.#data.commands.push(commandObj);
        }
    }

    #buildValidations() {
        for (const validationFunction of builtInValidations) {
            this.#data.builtInValidations.push(validationFunction);
        }
    }

    #handleCommands() {
        this.#data.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

            const targetCommand = this.#data.commands.find(
                (cmd) => cmd.data.name === interaction.commandName,
            );

            if (!targetCommand) return;

            const { data, options, run, ...rest } = targetCommand;

            const commandObj = {
                data: targetCommand.data,
                options: targetCommand.options,
                ...rest,
            };

            let canRun = true;

            for (const validationFunction of this.#data.customValidations) {
                const stopValidationLoop = await validationFunction({
                    interaction,
                    commandObj,
                    client: this.#data.client,
                    handler: this.#data.handler,
                });

                if (stopValidationLoop) {
                    canRun = false;
                    break;
                }
            }

            if (!canRun) return;

            // If custom validations pass and !skipBuiltInValidations, run built-in CommandKit validation functions
            if (!this.#data.skipBuiltInValidations) {
                for (const validation of this.#data.builtInValidations) {
                    const stopValidationLoop = validation({
                        targetCommand,
                        interaction,
                        handlerData: this.#data,
                    });

                    if (stopValidationLoop) {
                        canRun = false;
                        break;
                    }
                }
            }

            if (!canRun) return;

            targetCommand.run({
                interaction,
                client: this.#data.client,
                handler: this.#data.handler,
            });
        });
    }

    get commands() {
        return this.#data.commands;
    }

    async reloadCommands(options?: ReloadOptions) {
        this.#data.commands = [];
        await this.#buildCommands();

        console.log(this.#data.commands[0].data);

        let commands: CommandFileObject[];

        if (options?.type === 'dev') {
            commands = this.#data.commands.filter((cmd) => cmd.options?.devOnly);
        } else if (options?.type === 'global') {
            commands = this.#data.commands.filter((cmd) => !cmd.options?.devOnly);
        } else {
            commands = this.#data.commands;
        }

        await registerCommands({
            client: this.#data.client,
            devGuildIds: this.#data.devGuildIds,
            commands,
            reloading: true,
        });
    }
}
