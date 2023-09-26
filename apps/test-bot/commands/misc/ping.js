const { SlashCommandProps, CommandOptions, CommandData } = require('commandkit');

/**
 * @type {CommandData}
 */
const data = {
    name: 'ping',
    description: 'Pong!!!',
};

/**
 * @param {SlashCommandProps} param0
 */
function run({ interaction, handler }) {
    interaction.reply('Pong!');

    handler.reloadCommands();
}

/**
 * @type {CommandOptions}
 */
const options = {
    botPermissions: 'Administrator',
    userPermissions: [],
    devOnly: true,
};

module.exports = { data, run, options };
