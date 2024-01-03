import { Interaction } from 'discord.js';
import { getCommandHandler } from './common';

export function useInteraction<T>(): T {
    const { context } = getCommandHandler();

    const data = context.getStore();
    if (!data) {
        throw new Error('Cannot invoke "useInteraction" outside of a command.');
    }

    return data.interaction as T;
}
