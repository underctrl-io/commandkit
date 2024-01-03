import { CommandKit } from '..';

export const getCommandKit = () => {
    const instance = CommandKit.instance;
    if (!instance) {
        throw new Error('CommandKit is not initialized.');
    }

    return instance;
};

export const getCommandHandler = () => {
    const ckit = getCommandKit();
    const handler = ckit.getCommandHandler();

    if (!handler) {
        throw new Error('CommandHandler is not initialized.');
    }

    return handler;
};
