import {
  CompilerPlugin,
  MaybeFalsey,
  PluginTransformParameters,
  TransformedResult,
} from '../..';

/**
 * Macro plugin enables the use of `"use macro"` directive in the code.
 * Functions with this directive will be transformed at compile time
 * and only the result will be included in the final bundle.
 * @example function myMacro() {
 *   "use macro";
 *   return Math.random();
 * }
 *
 * // This will be transformed to a constant value at compile time.
 * const result = myMacro();
 */
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
    if (/\.json$/.test(params.id)) return null;

    const { contents } = await this.macroTransformer.transform(
      params.code,
      params.id,
    );

    return {
      code:
        typeof contents === 'string'
          ? contents
          : new TextDecoder().decode(contents),
      map: null,
    };
  }
}
