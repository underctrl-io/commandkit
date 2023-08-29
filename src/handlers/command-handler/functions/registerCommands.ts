import { Guild, GuildApplicationCommandManager } from 'discord.js';
import { CommandHandler } from '../CommandHandler';
import areSlashCommandsDifferent from '../utils/areSlashCommandsDifferent';
import colors from 'colors/safe';

export default async function registerCommands(commandHandler: CommandHandler) {
    const client = commandHandler._data.client;
    const devGuildIds = commandHandler._data.devGuildIds;
    const commands = commandHandler._data.commands;

    client.once('ready', async () => {
        const devGuilds: Guild[] = [];

        for (const devGuildId of devGuildIds) {
            const guild = client.guilds.cache.get(devGuildId);

            if (!guild) {
                console.log(
                    colors.yellow(`⏩ Ignoring: Guild ${devGuildId} does not exist or client isn't in this guild.`)
                );
                continue;
            }

            devGuilds.push(guild);
        }

        const appCommands = client.application?.commands;
        await appCommands?.fetch();

        const devGuildCommands: GuildApplicationCommandManager[] = [];

        for (const guild of devGuilds) {
            const guildCommands = guild.commands;
            await guildCommands?.fetch();
            devGuildCommands.push(guildCommands);
        }

        for (const command of commands) {
            // <!-- Delete command if options.deleted -->
            if (command.options?.deleted) {
                const targetCommand = appCommands?.cache.find((cmd) => cmd.name === command.data.name);

                if (!targetCommand) {
                    console.log(
                        colors.yellow(`⏩ Ignoring: Command "${command.data.name}" is globally marked as deleted.`)
                    );
                } else {
                    targetCommand.delete().then(() => {
                        console.log(colors.green(`🚮 Deleted command "${command.data.name}" globally.`));
                    });
                }

                for (const guildCommands of devGuildCommands) {
                    const targetCommand = guildCommands.cache.find((cmd) => cmd.name === command.data.name);

                    if (!targetCommand) {
                        console.log(
                            colors.yellow(
                                `⏩ Ignoring: Command "${command.data.name}" is marked as deleted for ${guildCommands.guild.name}.`
                            )
                        );
                    } else {
                        targetCommand.delete().then(() => {
                            console.log(
                                colors.green(
                                    `🚮 Deleted command "${command.data.name}" in ${guildCommands.guild.name}.`
                                )
                            );
                        });
                    }
                }

                continue;
            }

            // <!-- Edit command -->
            let commandData = command.data;
            let editedCommand = false;

            // Edit command globally
            const appGlobalCommand = appCommands?.cache.find((cmd) => cmd.name === command.data.name);

            if (appGlobalCommand) {
                const commandsAreDifferent = areSlashCommandsDifferent(appGlobalCommand, commandData);

                if (commandsAreDifferent) {
                    appGlobalCommand
                        .edit(commandData)
                        .then(() => {
                            console.log(colors.green(`✅ Edited command "${commandData.name}" globally.`));
                        })
                        .catch((error) => {
                            console.log(colors.red(`❌ Failed to edit command "${commandData.name}" globally.`));
                            console.error(error);
                        });

                    editedCommand = true;
                }
            }

            // Edit command in a specific guild
            for (const guildCommands of devGuildCommands) {
                const appGuildCommand = guildCommands.cache.find((cmd) => cmd.name === commandData.name);

                if (appGuildCommand) {
                    const commandsAreDifferent = areSlashCommandsDifferent(appGuildCommand, commandData);

                    if (commandsAreDifferent) {
                        appGuildCommand
                            .edit(commandData)
                            .then(() => {
                                console.log(
                                    colors.green(
                                        `✅ Edited command "${commandData.name}" in ${guildCommands.guild.name}.`
                                    )
                                );
                            })
                            .catch((error) => {
                                console.log(
                                    colors.red(
                                        `❌ Failed to edit command "${commandData.name}" in ${guildCommands.guild.name}.`
                                    )
                                );
                                console.error(error);
                            });

                        editedCommand = true;
                    }
                }
            }

            if (editedCommand) continue;

            // <!-- Register command -->
            // Register command in a specific guild
            if (command.options?.devOnly) {
                if (!devGuilds.length) {
                    console.log(
                        colors.yellow(
                            `⏩ Ignoring: Cannot register command "${command.data.name}" as no valid "devGuildIds" were provided.`
                        )
                    );
                    continue;
                }

                for (const guild of devGuilds) {
                    const cmdExists = guild.commands.cache.some((cmd) => cmd.name === command.data.name);
                    if (cmdExists) continue;

                    guild?.commands
                        .create(command.data)
                        .then(() => {
                            console.log(colors.green(`✅ Registered command "${command.data.name}" in ${guild.name}.`));
                        })
                        .catch((error) => {
                            console.log(
                                colors.red(`❌ Failed to register command "${command.data.name}" in ${guild.name}.`)
                            );
                            console.error(error);
                        });
                }
            }
            // Register command globally
            else {
                const cmdExists = appCommands?.cache.some((cmd) => cmd.name === command.data.name);
                if (cmdExists) continue;

                appCommands
                    ?.create(command.data)
                    .then(() => {
                        console.log(colors.green(`✅ Registered command "${command.data.name}" globally.`));
                    })
                    .catch((error) => {
                        console.log(colors.red(`❌ Failed to register command "${command.data.name}" globally.`));
                        console.error(error);
                    });
            }
        }
    });
}
