import type { Client } from 'discord.js';
import type { CommandFileObject } from '../../../typings';

import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';

import colors from 'colors/safe';

export default async function registerCommands(props: {
    client: Client;
    commands: CommandFileObject[];
    reloading?: boolean;
    type?: 'dev' | 'global';
    devGuildIds: string[];
}) {
    props.client.once('ready', async (client) => {
        const devOnlyCommands = props.commands.filter((cmd) => cmd.options?.devOnly);
        const globalCommands = props.commands.filter((cmd) => !cmd.options?.devOnly);

        if (props.type === 'dev') {
            await loadDevCommands(client, devOnlyCommands, props.devGuildIds, props.reloading);
        } else if (props.type === 'global') {
            await loadGlobalCommands(client, globalCommands, props.reloading);
        } else {
            await loadDevCommands(client, devOnlyCommands, props.devGuildIds, props.reloading);
            await loadGlobalCommands(client, globalCommands, props.reloading);
        }
    });
}

async function loadGlobalCommands(
    client: Client<true>,
    commands: CommandFileObject[],
    reloading?: boolean,
) {
    const rest = new REST({ version: '10' }).setToken(client.token);

    const data: any = await rest
        .put(Routes.applicationCommands(client.user.id), {
            body: commands,
        })
        .catch((error) => {
            console.error(
                colors.red(
                    `❌ Error ${
                        reloading ? 'reloading' : 'loading'
                    } global application commands.\n`,
                ),
                error,
            );
        });

    if (!data) return;

    console.log(
        colors.green(
            `✅ ${reloading ? 'Reloaded' : 'Loaded'} ${data.length} global application commands.`,
        ),
    );
}

async function loadDevCommands(
    client: Client<true>,
    commands: CommandFileObject[],
    guildIds: string[],
    reloading?: boolean,
) {
    const rest = new REST({ version: '10' }).setToken(client.token);

    for (const guildId of guildIds) {
        const targetGuild = client.guilds.cache.get(guildId);

        const data: any = await rest
            .put(Routes.applicationGuildCommands(client.user.id, guildId), {
                body: commands,
            })
            .catch((error) => {
                console.error(
                    colors.red(
                        `❌ Error ${
                            reloading ? 'reloading' : 'loading'
                        } developer application commands in guild "${
                            targetGuild?.name || guildId
                        }".\n`,
                    ),
                    error,
                );
            });

        if (!data) return;

        console.log(
            colors.green(
                `✅ ${reloading ? 'Reloaded' : 'Loaded'} ${
                    data.length
                } developer application commands in guild "${targetGuild?.name || guildId}".`,
            ),
        );
    }
}
