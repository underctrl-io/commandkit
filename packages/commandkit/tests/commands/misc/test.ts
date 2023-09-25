import { SlashCommandProps, CommandOptions, CommandData, CommandType } from '../../../src/index';

export const data: CommandData = {
    name: 'test',
    description: 'Pong!!',
};

export function run({ interaction, handler }: SlashCommandProps) {
    interaction.reply('Pong!');

    handler.reloadCommands();
}

export const options: CommandOptions = {
    botPermissions: 'Administrator',
    userPermissions: [],
    devOnly: true,
};
