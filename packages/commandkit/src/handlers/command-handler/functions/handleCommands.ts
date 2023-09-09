import { CommandHandler } from '../CommandHandler';

export default function handleCommands(commandHandler: CommandHandler) {
    const client = commandHandler._data.client;
    const handler = commandHandler._data.commandKitInstance;

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

        const targetCommand = commandHandler._data.commands.find(
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

        for (const validationFunction of commandHandler._data.customValidations) {
            const stopValidationLoop = await validationFunction({
                interaction,
                client,
                commandObj,
                handler,
            });

            if (stopValidationLoop) {
                canRun = false;
                break;
            }
        }

        if (!canRun) return;

        // If custom validations pass and !skipBuiltInValidations, run built-in CommandKit validation functions
        if (!commandHandler._data.skipBuiltInValidations) {
            for (const validation of commandHandler._data.builtInValidations) {
                const stopValidationLoop = validation({
                    targetCommand,
                    interaction,
                    handlerData: commandHandler._data,
                });

                if (stopValidationLoop) {
                    canRun = false;
                    break;
                }
            }
        }

        if (!canRun) return;

        targetCommand.run({ interaction, client, handler });
    });
}
