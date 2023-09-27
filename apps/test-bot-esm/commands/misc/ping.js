/**
 * @type {import('commandkit').CommandData}
 */
export const data = {
    name: 'ping',
    description: 'Pong!!',
};

/**
 * @param {import('commandkit').SlashCommandProps} param0
 */
export async function run({ interaction, handler }) {
    interaction.reply('Pong!');

    await handler.reloadCommands();
    console.log('Reloaded');
}

/**
 * @type {import('commandkit').CommandOptions}
 */
export const options = {
    botPermissions: 'Administrator',
    userPermissions: [],
    // devOnly: true,
    // deleted: true,
};
