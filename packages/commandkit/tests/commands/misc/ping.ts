import { SlashCommandProps, CommandOptions, CommandData, CommandType } from '../../../src/index';

export const data: CommandData = {
    name: 'ping',
    description: 'Pong!',
};

export async function run({ interaction, handler }: SlashCommandProps) {
    interaction.reply('Pong!');

    await handler
        .reloadCommands()
        .then(() => {
            console.log('Done');
        })
        .catch((e) => console.error(e));
}

export const options: CommandOptions = {
    botPermissions: 'Administrator',
    userPermissions: [],
};
