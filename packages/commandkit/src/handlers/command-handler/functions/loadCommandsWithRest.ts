import type { ApplicationCommandDataResolvable, Client } from 'discord.js';
import type { CommandFileObject, ReloadOptions } from '../../../typings';

import colors from '../../../utils/colors';

export default async function loadCommandsWithRest(props: {
    client: Client;
    commands: CommandFileObject[];
    devGuildIds: string[];
    reloading?: boolean;
    type?: ReloadOptions;
}) {
    if (props.reloading) {
        if (props.client.isReady()) {
            await handleLoading(
                props.client,
                props.commands,
                props.devGuildIds,
                props.reloading,
                props.type,
            );
        } else {
            throw new Error(colors.red(`❌ Cannot reload commands when client is not ready.`));
        }
    } else {
        props.client.once('ready', async (c) => {
            await handleLoading(c, props.commands, props.devGuildIds, props.reloading, props.type);
        });
    }
}

async function handleLoading(
    client: Client<true>,
    commands: CommandFileObject[],
    devGuildIds: string[],
    reloading?: boolean,
    type?: ReloadOptions,
) {
    const devOnlyCommands = commands.filter((cmd) => cmd.options?.devOnly);
    const globalCommands = commands.filter((cmd) => !cmd.options?.devOnly);

    if (type === 'dev') {
        await loadDevCommands(client, devOnlyCommands, devGuildIds, reloading);
    } else if (type === 'global') {
        await loadGlobalCommands(client, globalCommands, reloading);
    } else {
        await loadDevCommands(client, devOnlyCommands, devGuildIds, reloading);
        await loadGlobalCommands(client, globalCommands, reloading);
    }
}

async function loadGlobalCommands(
    client: Client<true>,
    commands: CommandFileObject[],
    reloading?: boolean,
) {
    const requestBody = commands.map((cmd) => cmd.data);

    await client.application.commands
        .set(requestBody as ApplicationCommandDataResolvable[])
        .catch((error) => {
            console.log(
                colors.red(
                    `❌ Error ${
                        reloading ? 'reloading' : 'loading'
                    } global application commands.\n`,
                ),
            );
            throw new Error(error);
        });

    console.log(
        colors.green(
            `✅ ${reloading ? 'Reloaded' : 'Loaded'} ${requestBody.length} global commands.`,
        ),
    );
}

async function loadDevCommands(
    client: Client<true>,
    commands: CommandFileObject[],
    guildIds: string[],
    reloading?: boolean,
) {
    const requestBody = commands.map((cmd) => cmd.data);

    for (const guildId of guildIds) {
        const targetGuild =
            client.guilds.cache.get(guildId) || (await client.guilds.fetch(guildId));

        if (!targetGuild) {
            console.log(
                `Couldn't ${
                    reloading ? 'reloading' : 'loading'
                } commands in guild "${targetGuild}" - guild doesn't exist or client isn't part of the guild.`,
            );

            continue;
        }

        await targetGuild.commands
            .set(requestBody as ApplicationCommandDataResolvable[])
            .catch((error) => {
                console.log(
                    colors.red(
                        `❌ Error ${
                            reloading ? 'reloading' : 'loading'
                        } developer application commands in guild "${
                            targetGuild?.name || guildId
                        }".\n`,
                    ),
                );
                throw new Error(error);
            });

        console.log(
            colors.green(
                `✅ ${reloading ? 'Reloaded' : 'Loaded'} ${
                    requestBody.length
                } developer commands in guild "${targetGuild.name}".`,
            ),
        );
    }
}
