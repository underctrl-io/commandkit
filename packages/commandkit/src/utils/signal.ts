export type CommandKitEffectCallback = () => void;
export type CommandKitSignalInitializer<T> = T | (() => T);
export type CommandKitSignalUpdater<T> = T | ((prev: T) => T);
export type CommandKitSignal<T> = readonly [
  () => T,
  (value: CommandKitSignalUpdater<T>) => void,
  () => void,
];

const context: CommandKitEffectCallback[] = [];

/**
 * Creates a new signal.
 * @param value - The initial value to use.
 * @returns An array of functions: a getter, a setter, and a disposer.
 */
export function createSignal<T = unknown>(
  value?: CommandKitSignalInitializer<T>,
) {
  const subscribers = new Set<() => void>();

  let disposed = false;
  let val: T | undefined = value instanceof Function ? value() : value;

  const getter = () => {
    if (!disposed) {
      const running = getCurrentObserver();
      if (running) subscribers.add(running);
    }

    return val;
  };

  const setter = (newValue: CommandKitSignalUpdater<T>) => {
    if (disposed) return;
    val = newValue instanceof Function ? newValue(val!) : newValue;

    for (const subscriber of subscribers) {
      subscriber();
    }
  };

  const dispose = () => {
    subscribers.clear();
    disposed = true;
  };

  return [getter, setter, dispose] as CommandKitSignal<T>;
}

/**
 * Creates a new effect.
 * @param callback - The callback function to execute.
 */
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

/**
 * Get the current observer.
 */
function getCurrentObserver() {
  return context[context.length - 1];
}
