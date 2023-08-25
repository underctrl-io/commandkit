import { BuiltInValidationParams } from '../typings';

export default function ({
    interaction,
    targetCommand,
}: BuiltInValidationParams) {
    const memberPermissions = interaction.memberPermissions;

    if (targetCommand.options?.userPermissions && memberPermissions) {
        for (const permission of targetCommand.options.userPermissions) {
            const hasPermission = memberPermissions.has(permission);

            if (!hasPermission) {
                interaction.reply({
                    content: `❌ You do not have enough permission to run this command. Required permission: \`${permission}\``,
                    ephemeral: true,
                });

                return true;
            }
        }
    }
}
