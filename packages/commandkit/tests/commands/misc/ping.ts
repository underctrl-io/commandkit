import { SlashCommandBuilder } from 'discord.js';
import { type SlashCommandProps, type CommandOptions, type CommandData, BasicSlashCommand, UserContextCommand, CommandType } from '../../../src/index';

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

export default new BasicSlashCommand({
    run: ({ interaction, client }) => {
        interaction.reply(`:ping_pong: Pong! \`${client.ws.ping}ms\``);
    },

    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),

    options: {
        devOnly: true
    }
})