import {
  CommonDirectiveTransformer,
  CommonDirectiveTransformerOptions,
} from './CommonDirectiveTransformer';

export class CachePlugin extends CommonDirectiveTransformer {
  public readonly name = 'CachePlugin';

  public constructor(options?: Partial<CommonDirectiveTransformerOptions>) {
    super({
      ...options,
      directive: 'use cache',
      importPath: 'commandkit',
      importName: '__SECRET_USE_CACHE_INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED',
      asyncOnly: true,
    });
  }
}
