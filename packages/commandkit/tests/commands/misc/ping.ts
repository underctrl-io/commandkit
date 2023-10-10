import { SlashCommandBuilder } from 'discord.js';
import {
    type SlashCommandProps,
    type CommandOptions,
    type CommandData,
    UserContextCommand,
    CommandType,
    SlashCommand,
} from '../../../src/index';

/*export const data: CommandData = {
    name: 'ping',
    description: 'Pong!',
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
    interaction.reply(`:ping_pong: Pong! \`${client.ws.ping}ms\``);
}

export const options: CommandOptions = {
    devOnly: true,
};*/

export default new SlashCommand()
    .setRun(({ interaction, client }) => {
        interaction.reply(`:ping_pong: Pong! \`${client.ws.ping}ms\``);
    })
    .setData({
        name: 'ping2',
        description: 'Pong!',
    })
    .setDeveloper(true)
