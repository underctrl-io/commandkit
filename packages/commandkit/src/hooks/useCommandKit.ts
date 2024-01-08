import { getCommandKit } from './common';

export function useCommandKit() {
    const kit = getCommandKit();
    if (!kit) throw new Error('CommandKit is not initialized.');

    return kit;
}
