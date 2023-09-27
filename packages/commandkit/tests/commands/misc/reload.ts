import { SlashCommandProps, CommandOptions, CommandData } from '../../../src/index';

export const data: CommandData = {
    name: 'reload',
    description: 'Reload commands',
};

export function run({ interaction, handler }: SlashCommandProps) {
    interaction.deferReply({ ephemeral: true });

    handler
        .reloadCommands()
        .then(() => {
            interaction.followUp('✅ Reloaded commands.');
        })
        .catch((error) => {
            interaction.followUp(`Failed to reload commands: ${error}`);
        });
}

export const options: CommandOptions = {
    userPermissions: [],
    devOnly: true,
};
