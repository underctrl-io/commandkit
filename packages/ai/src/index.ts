import { AiPlugin } from './plugin';
import { AiPluginOptions } from './types';

export function ai(options?: AiPluginOptions) {
  return new AiPlugin(options ?? {});
}

export * from './types';
export * from './plugin';
export * from './context';
