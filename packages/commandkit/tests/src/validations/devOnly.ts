import type { ValidationFunctionProps } from '../../../src';

export default function ({ interaction, commandObj, handler }: ValidationFunctionProps) {
    if (commandObj.data.name === 'ping') {
        interaction.reply('blocked...');
        return true;
    }
}
