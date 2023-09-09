import { SlashCommandProps, CommandOptions, CommandData, CommandType } from '../../src/index';

export const data: CommandData = {
    name: 'ping',
    description: 'Pong!',
    type: CommandType.User,
};

export function run({ interaction, handler }: SlashCommandProps) {
    interaction.reply('Pong!');

    console.log(handler.commands);
}

export const options: CommandOptions = {
    botPermissions: 'Administrator',
    userPermissions: [],
};
