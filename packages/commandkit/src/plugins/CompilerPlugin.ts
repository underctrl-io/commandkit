import {
  isPlugin,
  PluginCommon,
  PluginOptions,
  PluginType,
} from './PluginCommon';
import { MaybeFalsey } from './types';
import { CompilerPluginRuntime } from './plugin-runtime/CompilerPluginRuntime';

/**
 * The parameters for the transformation function of a compiler plugin.
 */
export interface PluginTransformParameters {
  /**
   * The code to be transformed.
   */
  code: string;
  /**
   * The filename of the code being transformed.
   */
  id: string;
}

export interface TransformedResult {
  /**
   * The transformed code.
   */
  code?: string;
  /**
   * The source map for the transformed code, if applicable.
   */
  map?: string | null;
}

/**
 * CommandKit plugin that runs at compile time.
 */
export abstract class CompilerPlugin<
  T extends PluginOptions = PluginOptions,
> extends PluginCommon<T, CompilerPluginRuntime> {
  /**
   * The type of the plugin, which is Compiler.
   */
  public readonly type = PluginType.Compiler;

  /**
   * Called when transformation is requested to this plugin
   * @param params The parameters for the transformation
   * @returns The transformed result
   */
  public async transform(
    params: PluginTransformParameters,
  ): Promise<MaybeFalsey<TransformedResult>> {
    return null;
  }
}

/**
 * Type guard to check if the given object is a CompilerPlugin.
 * @param plugin The object to check.
 * @returns Boolean indicating whether the object is a CompilerPlugin.
 */
export function isCompilerPlugin(plugin: unknown): plugin is CompilerPlugin {
  return (
    plugin instanceof CompilerPlugin ||
    (isPlugin(plugin) && plugin.type === PluginType.Compiler)
  );
}
