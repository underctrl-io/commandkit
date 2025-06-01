import {
  isPlugin,
  PluginCommon,
  PluginOptions,
  PluginType,
} from './PluginCommon';
import { MaybeFalsey } from './types';
import { CompilerPluginRuntime } from './plugin-runtime/CompilerPluginRuntime';

export interface PluginTransformParameters {
  code: string;
  id: string;
}

export interface TransformedResult {
  code?: string;
  map?: string | null;
}

export abstract class CompilerPlugin<
  T extends PluginOptions = PluginOptions,
> extends PluginCommon<T, CompilerPluginRuntime> {
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

export function isCompilerPlugin(plugin: unknown): plugin is CompilerPlugin {
  return (
    plugin instanceof CompilerPlugin ||
    (isPlugin(plugin) && plugin.type === PluginType.Compiler)
  );
}
