import { useCommandKit } from './useCommandKit';

export function useClient() {
    return useCommandKit().client;
}
