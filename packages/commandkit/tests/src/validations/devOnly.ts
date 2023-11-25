import type { ValidationFunctionProps } from '../../../src';

export default function ({ interaction, commandObj, handler }: ValidationFunctionProps) {
    if (interaction.isAutocomplete()) return;
    if (commandObj.data.name === 'ping') {
        interaction.reply('blocked...');
        return true;
    }
}
