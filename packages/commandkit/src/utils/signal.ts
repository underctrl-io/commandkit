export type CommandKitEffectCallback = () => void;
export type CommandKitSignalInitializer<T> = T | (() => T);
export type CommandKitSignalUpdater<T> = T | ((prev: T) => T);
export type CommandKitSignal<T> = readonly [
    () => T,
    (value: CommandKitSignalUpdater<T>) => void,
    () => void,
];

const context: CommandKitEffectCallback[] = [];

export function createSignal<T = unknown>(value?: CommandKitSignalInitializer<T>) {
    const subscribers = new Set<() => void>();

    let val: T | undefined = value instanceof Function ? value() : value;

    const getter = () => {
        const running = getCurrentObserver();

        if (running) subscribers.add(running);
        return val;
    };

    const setter = (newValue: CommandKitSignalUpdater<T>) => {
        val = newValue instanceof Function ? newValue(val!) : newValue;

        for (const subscriber of subscribers) {
            subscriber();
        }
    };

    const dispose = () => {
        subscribers.clear();
    };

    return [getter, setter, dispose] as CommandKitSignal<T>;
}

export function createEffect(callback: CommandKitEffectCallback) {
    const execute = () => {
        context.push(execute);

        try {
            callback();
        } finally {
            context.pop();
        }
    };

    execute();
}

function getCurrentObserver() {
    return context[context.length - 1];
}
