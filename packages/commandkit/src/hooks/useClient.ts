import { getCommandKit } from './common';

export function useClient() {
    return getCommandKit().getClient();
}
