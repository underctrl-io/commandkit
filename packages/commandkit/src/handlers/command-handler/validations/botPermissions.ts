import { BuiltInValidationParams } from '../typings';

export default function ({ interaction, targetCommand }: BuiltInValidationParams) {
    const botMember = interaction.guild?.members.me;

    if (targetCommand.options?.botPermissions && botMember) {
        for (const permission of targetCommand.options.botPermissions) {
            const hasPermission = botMember.permissions.has(permission);

            if (!hasPermission) {
                interaction.reply({
                    content: `❌ I do not have enough permission to execute this command. Required permission: \`${permission}\``,
                    ephemeral: true,
                });

                return true;
            }
        }
    }
}
