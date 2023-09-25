import { BuiltInValidationParams } from '../types';

export default function ({ interaction, targetCommand }: BuiltInValidationParams) {
    const botMember = interaction.guild?.members.me;
    let commandPermissions = targetCommand.options?.botPermissions;

    if (!botMember || !commandPermissions) return;

    if (!Array.isArray(commandPermissions)) {
        commandPermissions = [commandPermissions];
    }

    const missingPermissions: string[] = [];

    for (const permission of commandPermissions) {
        const hasPermission = botMember.permissions.has(permission);

        if (!hasPermission) {
            missingPermissions.push(`\`${permission.toString()}\``);
        }
    }

    if (missingPermissions.length) {
        interaction.reply({
            content: `❌ I do not have enough permissions to execute this command. Missing: ${missingPermissions.join(
                ', ',
            )}`,
            ephemeral: true,
        });

        return true;
    }
}
