const { PermissionFlagsBits } = require('discord.js');
const { SlashCommandProps, CommandOptions, CommandData } = require('commandkit');

/**
 * @type {CommandData}
 */
const data = {
    name: 'ping',
    description: 'Pong!!',
};

/**
 * @param {SlashCommandProps} param0
 */
async function run({ interaction, handler }) {
    interaction.reply('Pong!');

    await handler.reloadCommands();
    console.log('Reloaded');
}

/**
 * @type {CommandOptions}
 */
const options = {
    botPermissions: 'Administrator',
    userPermissions: [PermissionFlagsBits.Administrator],
    // devOnly: true,
    // deleted: true,
};

module.exports = { data, run, options };
