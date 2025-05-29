import { DirectiveTransformerOptions } from 'directive-to-hof';
import {
  CompilerPlugin,
  CompilerPluginRuntime,
  MaybeFalsey,
  PluginTransformParameters,
  TransformedResult,
} from '../..';

export type CommonDirectiveTransformerOptions = DirectiveTransformerOptions & {
  enabled?: boolean;
};

export abstract class CommonDirectiveTransformer extends CompilerPlugin<CommonDirectiveTransformerOptions> {
  private transformer: ReturnType<
    typeof import('directive-to-hof').createDirectiveTransformer
  > | null = null;

  public async activate(ctx: CompilerPluginRuntime): Promise<void> {
    const { createDirectiveTransformer } = await import('directive-to-hof');
    this.transformer = createDirectiveTransformer(this.options);
  }

  public async deactivate(ctx: CompilerPluginRuntime): Promise<void> {
    this.transformer = null;
  }

  public async transform(
    params: PluginTransformParameters,
  ): Promise<MaybeFalsey<TransformedResult>> {
    if (!this.options.enabled) return null;
    if (!this.transformer) return null;
    if (/\.json$/.test(params.id)) return null;

    const result = await this.transformer(params.code.toString(), params.id);

    return {
      code: result.contents,
      map: null,
    };
  }
}
