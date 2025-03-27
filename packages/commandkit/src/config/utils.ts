import { CommandKitConfig } from './types';

export type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>;
};

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export const mergeDeep = <T extends Record<string, any>>(
  target: T,
  source: T,
): T => {
  const isObject = (obj: unknown) =>
    obj && typeof obj === 'object' && !Array.isArray(obj);

  const output: T = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key as keyof T] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output as T;
};

export type ResolvedCommandKitConfig = DeepRequired<CommandKitConfig>;
