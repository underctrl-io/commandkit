import type {
  CommonDirectiveTransformerOptions,
  CommandKitPlugin,
} from 'commandkit';
import { UseCacheDirectivePlugin } from './use-cache-directive';
import { CachePlugin } from './cache-plugin';

export * from './cache-provider';
export * from './providers/memory-cache';
export * from './use-cache';
export * from './use-cache-directive';
export * from './cache-plugin';

/**
 * The cache plugin for CommandKit.
 * @param options The options for the cache plugin.
 * @returns The cache plugin for CommandKit.
 */
export function cache(
  options?: Partial<{
    compiler: CommonDirectiveTransformerOptions;
    runtime: Record<never, never>;
  }>,
): CommandKitPlugin[] {
  const compiler = new UseCacheDirectivePlugin(options?.compiler);
  const runtime = new CachePlugin(options?.runtime ?? {});

  return [compiler, runtime];
}
