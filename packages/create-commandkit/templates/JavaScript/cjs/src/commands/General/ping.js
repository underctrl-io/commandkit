module.exports = {
  /** @type {import('commandkit').CommandData}  */
  data: {
    name: 'ping',
    description: 'Replies with Pong',
  },

  /**
   * @param {import('commandkit').SlashCommandProps} param0
   */
  run: ({ interaction }) => {
    interaction.reply('Pong!');
  },

  /** @type {import('commandkit').CommandOptions} */
  options: {
    // https://commandkit.js.org/typedef/CommandOptions
  },
};
