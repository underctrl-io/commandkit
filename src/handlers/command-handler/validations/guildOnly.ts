import { BuiltInValidationParams } from '../typings';

module.exports = ({ interaction, targetCommand }: BuiltInValidationParams) => {
    if (targetCommand.options?.guildOnly && !interaction.inGuild()) {
        interaction.reply({
            content: '❌ This command can only be used inside a server.',
            ephemeral: true,
        });

        return true;
    }
};
