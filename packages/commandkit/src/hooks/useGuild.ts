import { getCommandHandler } from './common';

export function useGuild() {
    const { context } = getCommandHandler();

    const data = context.getStore();

    if (!data) {
        throw new Error('Cannot invoke "useGuild" outside of a command.');
    }

    return data.interaction.guild;
}
