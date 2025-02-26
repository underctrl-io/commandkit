import { MacroTransformer } from 'use-macro';
import {
  CompilerPlugin,
  MaybeFalsey,
  PluginTransformParameters,
  TransformedResult,
} from '../..';

export class MacroPlugin extends CompilerPlugin {
  public readonly name = 'MacroPlugin';

  private macroTransformer!: MacroTransformer;

  public async activate(): Promise<void> {
    this.macroTransformer = new MacroTransformer();
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
