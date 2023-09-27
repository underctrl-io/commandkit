import type {
    Guild,
    Client,
    ApplicationCommandData,
    GuildApplicationCommandManager,
    ApplicationCommandDataResolvable,
} from 'discord.js';
import type { CommandFileObject, ReloadOptions } from '../../../typings';

import areSlashCommandsDifferent from '../utils/areSlashCommandsDifferent';

import colors from '../../../utils/colors';

export default async function registerCommands(props: {
    client: Client;
    commands: CommandFileObject[];
    devGuildIds: string[];
    reloading?: boolean;
    type?: ReloadOptions;
}) {
    if (props.reloading) {
        if (props.client.isReady()) {
            await handleRegistration(props.client, props.commands, props.devGuildIds, props.type);
        } else {
            throw new Error(colors.red(`❌ Cannot reload commands when client is not ready.`));
        }
    } else {
        props.client.once('ready', async (c) => {
            await handleRegistration(c, props.commands, props.devGuildIds, props.type);
        });
    }
}

async function handleRegistration(
    client: Client<true>,
    commands: CommandFileObject[],
    devGuildIds: string[],
    type?: ReloadOptions,
) {
    const devOnlyCommands = commands.filter((cmd) => cmd.options?.devOnly);
    const globalCommands = commands.filter((cmd) => !cmd.options?.devOnly);

    if (type === 'dev') {
        await registerDevCommands(client, devOnlyCommands, devGuildIds);
    } else if (type === 'global') {
        await registerGlobalCommands(client, globalCommands);
    } else {
        await registerDevCommands(client, devOnlyCommands, devGuildIds);
        await registerGlobalCommands(client, globalCommands);
    }
}

async function registerGlobalCommands(client: Client<true>, commands: CommandFileObject[]) {
    const appCommandsManager = client.application.commands;
    await appCommandsManager.fetch();

    for (const command of commands) {
        const targetCommand = appCommandsManager.cache.find(
            (cmd) => cmd.name === command.data.name,
        );

        // <!-- Delete global command -->
        if (command.options?.deleted) {
            if (!targetCommand) {
                console.log(
                    colors.yellow(
                        `⏩ Ignoring: Command "${command.data.name}" is globally marked as deleted.`,
                    ),
                );
            } else {
                targetCommand.delete().then(() => {
                    console.log(
                        colors.green(`🚮 Deleted command "${command.data.name}" globally.`),
                    );
                });
            }

            continue;
        }

        // <!-- Edit global command -->
        if (targetCommand) {
            const commandsAreDifferent = areSlashCommandsDifferent(targetCommand, command.data);

            if (commandsAreDifferent) {
                targetCommand
                    .edit(command.data as Partial<ApplicationCommandData>)
                    .then(() => {
                        console.log(
                            colors.green(`✅ Edited command "${command.data.name}" globally.`),
                        );
                    })
                    .catch((error) => {
                        console.log(
                            colors.red(
                                `❌ Failed to edit command "${command.data.name}" globally.`,
                            ),
                        );
                        console.error(error);
                    });

                continue;
            }
        }

        // <!-- Register global command -->
        if (targetCommand) continue;

        appCommandsManager
            .create(command.data as ApplicationCommandDataResolvable)
            .then(() => {
                console.log(colors.green(`✅ Registered command "${command.data.name}" globally.`));
            })
            .catch((error) => {
                console.log(
                    colors.red(`❌ Failed to register command "${command.data.name}" globally.`),
                );
                console.error(error);
            });
    }
}

async function registerDevCommands(
    client: Client<true>,
    commands: CommandFileObject[],
    guildIds: string[],
) {
    const devGuilds: Guild[] = [];

    for (const guildId of guildIds) {
        const guild = client.guilds.cache.get(guildId) || (await client.guilds.fetch(guildId));

        if (!guild) {
            console.log(
                colors.yellow(
                    `⏩ Ignoring: Guild ${guildId} does not exist or client isn't in this guild.`,
                ),
            );
            continue;
        }

        devGuilds.push(guild);
    }

    const guildCommandsManagers: GuildApplicationCommandManager[] = [];

    for (const guild of devGuilds) {
        const guildCommandsManager = guild.commands;
        await guildCommandsManager.fetch();

        guildCommandsManagers.push(guildCommandsManager);
    }

    for (const command of commands) {
        for (const guildCommands of guildCommandsManagers) {
            const targetCommand = guildCommands.cache.find((cmd) => cmd.name === command.data.name);

            // <!-- Delete dev command -->
            if (command.options?.deleted) {
                if (!targetCommand) {
                    console.log(
                        colors.yellow(
                            `⏩ Ignoring: Command "${command.data.name}" is marked as deleted for ${guildCommands.guild.name}.`,
                        ),
                    );
                } else {
                    targetCommand.delete().then(() => {
                        console.log(
                            colors.green(
                                `🚮 Deleted command "${command.data.name}" in ${guildCommands.guild.name}.`,
                            ),
                        );
                    });
                }

                continue;
            }

            // <!-- Edit dev command -->
            if (targetCommand) {
                const commandsAreDifferent = areSlashCommandsDifferent(targetCommand, command.data);

                if (commandsAreDifferent) {
                    targetCommand
                        .edit(command.data as Partial<ApplicationCommandData>)
                        .then(() => {
                            console.log(
                                colors.green(
                                    `✅ Edited command "${command.data.name}" in ${guildCommands.guild.name}.`,
                                ),
                            );
                        })
                        .catch((error) => {
                            console.log(
                                colors.red(
                                    `❌ Failed to edit command "${command.data.name}" in ${guildCommands.guild.name}.`,
                                ),
                            );
                            console.error(error);
                        });

                    continue;
                }
            }

            // <!-- Register guild command -->
            if (targetCommand) continue;

            guildCommands
                .create(command.data as ApplicationCommandDataResolvable)
                .then(() => {
                    console.log(
                        colors.green(
                            `✅ Registered command "${command.data.name}" in ${guildCommands.guild.name}.`,
                        ),
                    );
                })
                .catch((error) => {
                    console.log(
                        colors.red(
                            `❌ Failed to register command "${command.data.name}" in ${guildCommands.guild.name}.`,
                        ),
                    );
                    console.error(error);
                });
        }
    }
}
