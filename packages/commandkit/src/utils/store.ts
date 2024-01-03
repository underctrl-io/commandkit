import { AsyncLocalStorage } from 'node:async_hooks';

export const createStore = <T = unknown>() => {
    return new AsyncLocalStorage<T>();
};
