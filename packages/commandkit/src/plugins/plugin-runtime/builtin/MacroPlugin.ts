import {
  CompilerPlugin,
  MaybeFalsey,
  PluginTransformParameters,
  TransformedResult,
} from '../..';

export class MacroPlugin extends CompilerPlugin {
  public readonly name = 'MacroPlugin';

  private macroTransformer!: import('use-macro').MacroTransformer;

  public async activate(): Promise<void> {
    const transform = await import('use-macro');
    this.macroTransformer = new transform.MacroTransformer();
  }

  public async deactivate(): Promise<void> {
    this.macroTransformer = null!;
  }

  public async transform(
    params: PluginTransformParameters,
  ): Promise<MaybeFalsey<TransformedResult>> {
    if (!this.options.enabled) return null;

    const { contents, loader } = await this.macroTransformer.transform(
      params.contents.toString(),
      params.path,
    );

    return {
      contents,
      loader,
    };
  }
}
