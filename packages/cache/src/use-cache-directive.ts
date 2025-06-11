import {
  CommonDirectiveTransformer,
  CommonDirectiveTransformerOptions,
  CompilerPluginRuntime,
  Logger,
} from 'commandkit';

/**
 * Compiler plugin for the "use cache" directive.
 * This plugin transforms the "use cache" directive into a runtime cache operation.
 * It is designed to work with the CommandKit framework.
 */
export class UseCacheDirectivePlugin extends CommonDirectiveTransformer {
  public readonly name = 'UseCacheDirectivePlugin';

  public constructor(options?: Partial<CommonDirectiveTransformerOptions>) {
    super({
      enabled: true,
      ...options,
      directive: 'use cache',
      importPath: '@commandkit/cache',
      importName: '$ckitiucw',
      asyncOnly: true,
    });
  }

  public async activate(ctx: CompilerPluginRuntime): Promise<void> {
    super.activate(ctx);
    Logger.info('"use cache" directive compiler plugin activated');
  }
}
