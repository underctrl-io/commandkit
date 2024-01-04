import { CommandKit } from '..';

export function getCommandKit() {
    return CommandKit._instance;
}

export function getCommandHandler() {
    const handler = getCommandKit()?.commandHandler;

    if (!handler) {
        throw new Error('CommandKit is not initialized.');
    }

    return handler;
}

export function getContext() {
    const info = getCommandHandler().context;
    if (!info) {
        throw new Error('Context is not available, did you forget to enable hooks?');
    }

    return info;
}

export function prepareHookInvocationError(name: string) {
    return new Error(`Cannot invoke hook "${name}" outside of a command.`);
}
