import { BuiltInValidationParams } from '../typings';

export default function ({ interaction, targetCommand }: BuiltInValidationParams) {
    const botMember = interaction.guild?.members.me;

    if (targetCommand.options?.botPermissions && botMember) {
        const missingPermissions: string[] = [];

        for (const permission of targetCommand.options.botPermissions) {
            const hasPermission = botMember.permissions.has(permission);

            if (!hasPermission) {
                missingPermissions.push(`\`${permission.toString()}\``);
            }
        }

        if (missingPermissions.length) {
            interaction.reply({
                content: `❌ I do not have enough permission to execute this command. Missing: ${missingPermissions.join(
                    ', ',
                )}`,
                ephemeral: true,
            });

            return true;
        }
    }
}
