import { SlashCommandProps, CommandOptions, CommandData } from '../../../src/index';

export const data: CommandData = {
    name: 'reload',
    description: 'Reload commands, events, and validations.',
};

export async function run({ interaction, handler }: SlashCommandProps) {
    interaction.deferReply({ ephemeral: true });

    await handler.reloadCommands();
    console.log('Reloaded commands');

    await handler.reloadValidations();
    console.log('Reloaded validations');

    await handler.reloadEvents();
    console.log('Reloaded events');

    interaction.followUp('Done!');
}

export const options: CommandOptions = {
    userPermissions: [],
    devOnly: true,
};
