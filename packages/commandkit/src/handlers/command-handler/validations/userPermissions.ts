import { BuiltInValidationParams } from '../typings';

export default function ({ interaction, targetCommand }: BuiltInValidationParams) {
    const memberPermissions = interaction.memberPermissions;

    if (targetCommand.options?.userPermissions && memberPermissions) {
        const missingPermissions: string[] = [];

        for (const permission of targetCommand.options.userPermissions) {
            const hasPermission = memberPermissions.has(permission);

            if (!hasPermission) {
                missingPermissions.push(`\`${permission.toString()}\``);
            }
        }

        if (missingPermissions.length) {
            interaction.reply({
                content: `❌ You do not have enough permission to run this command. Missing: ${missingPermissions.join(
                    ', ',
                )}`,
                ephemeral: true,
            });

            return true;
        }
    }
}
