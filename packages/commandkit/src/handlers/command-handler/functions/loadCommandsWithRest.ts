import type { Client } from 'discord.js';
import type { CommandFileObject, ReloadType } from '../../../typings';

import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';

import colors from '../../../utils/colors';

export default async function loadCommandsWithRest(props: {
    client: Client;
    commands: CommandFileObject[];
    devGuildIds: string[];
    reloading?: boolean;
    type?: ReloadType;
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
    type?: ReloadType,
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
    const rest = new REST({ version: '10' }).setToken(client.token);

    const requestBody = commands.map((cmd) => cmd.data);

    const data: any = await rest
        .put(Routes.applicationCommands(client.user.id), {
            body: requestBody,
        })
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

    if (!data) return;

    console.log(colors.green(`✅ Loaded ${data.length} global commands.`));
}

async function loadDevCommands(
    client: Client<true>,
    commands: CommandFileObject[],
    guildIds: string[],
    reloading?: boolean,
) {
    const rest = new REST({ version: '10' }).setToken(client.token);

    const requestBody = commands.map((cmd) => cmd.data);

    for (const guildId of guildIds) {
        const targetGuild = client.guilds.cache.get(guildId);

        const data: any = await rest
            .put(Routes.applicationGuildCommands(client.user.id, guildId), {
                body: requestBody,
            })
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

        if (!data) return;

        console.log(
            colors.green(
                `✅ Loaded ${data.length} developer commands in guild "${
                    targetGuild?.name || guildId
                }".`,
            ),
        );
    }
}
