import {
  CommonDirectiveTransformer,
  CommonDirectiveTransformerOptions,
  CompilerPluginRuntime,
  Logger,
} from 'commandkit';

export class UseCacheDirectivePlugin extends CommonDirectiveTransformer {
  public readonly name = 'UseCacheDirectivePlugin';

  public constructor(options?: Partial<CommonDirectiveTransformerOptions>) {
    super({
      enabled: true,
      ...options,
      directive: 'use cache',
      importPath: '@commandkit/cache',
      importName: '__SECRET_USE_CACHE_INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED',
      asyncOnly: true,
    });
  }

  public async activate(ctx: CompilerPluginRuntime): Promise<void> {
    super.activate(ctx);
    Logger.info('"use cache" directive compiler plugin activated');
  }
}
