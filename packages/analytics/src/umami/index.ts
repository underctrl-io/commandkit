import { UmamiPlugin, UmamiPluginOptions } from './plugin';

export function umami(options: UmamiPluginOptions) {
  return new UmamiPlugin(options);
}

export * from './plugin';
export * from './provider';
