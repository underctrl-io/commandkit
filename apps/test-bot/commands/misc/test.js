const { SlashCommandProps, CommandOptions, CommandData } = require('commandkit');

/**
 * @type {CommandData}
 */
const data = {
    name: 'test',
    description: 'Test!!',
};

/**
 * @param {SlashCommandProps} param0
 */
function run({ interaction, handler }) {
    interaction.reply('Test!');

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
