export const data = {
    name: 'test',
    description: 'Test!!',
};

export function run({ interaction, handler }) {
    interaction.reply('Test!');

    handler.reloadCommands();
}

export const options = {
    botPermissions: 'Administrator',
    userPermissions: [],
    devOnly: true,
};
