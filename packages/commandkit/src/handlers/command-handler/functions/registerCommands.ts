import type {
    Guild,
    GuildApplicationCommandManager,
    Client,
    ApplicationCommandData,
    ApplicationCommandDataResolvable,
} from 'discord.js';
import type { CommandData } from '../../..';
import type { CommandFileObject } from '../../../typings';
import areSlashCommandsDifferent from '../utils/areSlashCommandsDifferent';
import colors from 'colors/safe';

export default async function registerCommands({
    client,
    devGuildIds,
    commands,
    reloading,
}: {
    client: Client;
    devGuildIds: string[];
    commands: CommandFileObject[];
    reloading?: boolean;
}) {
    if (reloading) {
        handleRegistration();
    } else {
        client.once('ready', handleRegistration);
    }

    async function handleRegistration() {
        const devGuilds: Guild[] = [];

        for (const devGuildId of devGuildIds) {
            const guild = client.guilds.cache.get(devGuildId);

            if (!guild) {
                console.log(
                    colors.yellow(
                        `⏩ Ignoring: Guild ${devGuildId} does not exist or client isn't in this guild.`,
                    ),
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
            let commandData = command.data as CommandData;

            // <!-- Delete command if options.deleted -->
            if (command.options?.deleted) {
                const targetCommand = appCommands?.cache.find(
                    (cmd) => cmd.name === commandData.name,
                );

                if (!targetCommand) {
                    console.log(
                        colors.yellow(
                            `⏩ Ignoring: Command "${commandData.name}" is globally marked as deleted.`,
                        ),
                    );
                } else {
                    targetCommand.delete().then(() => {
                        console.log(
                            colors.green(`🚮 Deleted command "${commandData.name}" globally.`),
                        );
                    });
                }

                for (const guildCommands of devGuildCommands) {
                    const targetCommand = guildCommands.cache.find(
                        (cmd) => cmd.name === commandData.name,
                    );

                    if (!targetCommand) {
                        console.log(
                            colors.yellow(
                                `⏩ Ignoring: Command "${commandData.name}" is marked as deleted for ${guildCommands.guild.name}.`,
                            ),
                        );
                    } else {
                        targetCommand.delete().then(() => {
                            console.log(
                                colors.green(
                                    `🚮 Deleted command "${commandData.name}" in ${guildCommands.guild.name}.`,
                                ),
                            );
                        });
                    }
                }

                continue;
            }

            // <!-- Edit command -->
            let editedCommand = false;

            // Edit command globally
            const appGlobalCommand = appCommands?.cache.find(
                (cmd) => cmd.name === commandData.name,
            );

            if (appGlobalCommand) {
                const commandsAreDifferent = areSlashCommandsDifferent(
                    appGlobalCommand,
                    commandData,
                );

                if (commandsAreDifferent) {
                    appGlobalCommand
                        .edit(commandData as Partial<ApplicationCommandData>)
                        .then(() => {
                            console.log(
                                colors.green(`✅ Edited command "${commandData.name}" globally.`),
                            );
                        })
                        .catch((error) => {
                            console.log(
                                colors.red(
                                    `❌ Failed to edit command "${commandData.name}" globally.`,
                                ),
                            );
                            console.error(error);
                        });

                    editedCommand = true;
                }
            }

            // Edit command in a specific guild
            for (const guildCommands of devGuildCommands) {
                const appGuildCommand = guildCommands.cache.find(
                    (cmd) => cmd.name === commandData.name,
                );

                if (appGuildCommand) {
                    const commandsAreDifferent = areSlashCommandsDifferent(
                        appGuildCommand,
                        commandData,
                    );

                    if (commandsAreDifferent) {
                        appGuildCommand
                            .edit(commandData as Partial<ApplicationCommandData>)
                            .then(() => {
                                console.log(
                                    colors.green(
                                        `✅ Edited command "${commandData.name}" in ${guildCommands.guild.name}.`,
                                    ),
                                );
                            })
                            .catch((error) => {
                                console.log(
                                    colors.red(
                                        `❌ Failed to edit command "${commandData.name}" in ${guildCommands.guild.name}.`,
                                    ),
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
                            `⏩ Ignoring: Cannot register command "${commandData.name}" as no valid "devGuildIds" were provided.`,
                        ),
                    );
                    continue;
                }

                for (const guild of devGuilds) {
                    const cmdExists = guild.commands.cache.some(
                        (cmd) => cmd.name === commandData.name,
                    );
                    if (cmdExists) continue;

                    guild?.commands
                        .create(commandData as ApplicationCommandDataResolvable)
                        .then(() => {
                            console.log(
                                colors.green(
                                    `✅ Registered command "${commandData.name}" in ${guild.name}.`,
                                ),
                            );
                        })
                        .catch((error) => {
                            console.log(
                                colors.red(
                                    `❌ Failed to register command "${commandData.name}" in ${guild.name}.`,
                                ),
                            );
                            console.error(error);
                        });
                }
            }
            // Register command globally
            else {
                const cmdExists = appCommands?.cache.some((cmd) => cmd.name === commandData.name);
                if (cmdExists) continue;

                appCommands
                    ?.create(commandData as ApplicationCommandDataResolvable)
                    .then(() => {
                        console.log(
                            colors.green(`✅ Registered command "${commandData.name}" globally.`),
                        );
                    })
                    .catch((error) => {
                        console.log(
                            colors.red(
                                `❌ Failed to register command "${commandData.name}" globally.`,
                            ),
                        );
                        console.error(error);
                    });
            }
        }
    }
}
