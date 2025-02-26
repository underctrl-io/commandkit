import {
  CompilerPlugin,
  MaybeFalsey,
  PluginTransformParameters,
  TransformedResult,
} from '../../..';
import { cacheDirectivePlugin } from './UseCacheTransformer';

export class CachePlugin extends CompilerPlugin {
  public readonly name = 'CachePlugin';

  public async transform(
    params: PluginTransformParameters,
  ): Promise<MaybeFalsey<TransformedResult>> {
    if (!this.options.enabled) return null;

    const result = await cacheDirectivePlugin(
      params.contents.toString(),
      params.path,
    );

    return {
      contents: result.contents,
      loader: result.loader,
    };
  }
}
