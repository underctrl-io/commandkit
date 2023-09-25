import { BuiltInValidationParams } from '../types';

export default function ({ interaction, targetCommand }: BuiltInValidationParams) {
    const memberPermissions = interaction.memberPermissions;
    let commandPermissions = targetCommand.options?.userPermissions;

    if (!memberPermissions || !commandPermissions) return;

    if (!Array.isArray(commandPermissions)) {
        commandPermissions = [commandPermissions];
    }

    const missingPermissions: string[] = [];

    for (const permission of commandPermissions) {
        const hasPermission = memberPermissions.has(permission);

        if (!hasPermission) {
            missingPermissions.push(`\`${permission.toString()}\``);
        }
    }

    if (missingPermissions.length) {
        interaction.reply({
            content: `❌ You do not have enough permissions to run this command. Missing: ${missingPermissions.join(
                ', ',
            )}`,
            ephemeral: true,
        });

        return true;
    }
}
