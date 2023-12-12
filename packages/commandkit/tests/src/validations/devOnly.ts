import type { ValidationProps } from '../../../src';

export default function ({ interaction, commandObj, handler }: ValidationProps) {
    if (interaction.isAutocomplete()) return;
    if (commandObj.data.name === 'ping') {
        interaction.reply('blocked...');
        return true;
    }
}
