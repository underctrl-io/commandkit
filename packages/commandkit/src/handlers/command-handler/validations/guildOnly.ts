import { BuiltInValidationParams } from '../types';

export default function ({ interaction, targetCommand }: BuiltInValidationParams) {
    if (targetCommand.options?.guildOnly && !interaction.inGuild()) {
        interaction.reply({
            content: '❌ This command can only be used inside a server.',
            ephemeral: true,
        });

        return true;
    }
}
