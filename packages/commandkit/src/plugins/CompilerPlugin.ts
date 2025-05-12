import {
  Loader,
  OnLoadArgs,
  OnResolveArgs,
  OnResolveResult,
} from './plugin-runtime/types';
import {
  isPlugin,
  PluginCommon,
  PluginOptions,
  PluginType,
} from './PluginCommon';
import { MaybeFalsey } from './types';
import { CompilerPluginRuntime } from './plugin-runtime/CompilerPluginRuntime';

export interface PluginTransformParameters {
  args: OnLoadArgs;
  path: string;
  contents: string | Uint8Array;
  loader?: Loader;
}

export interface TransformedResult {
  contents?: string | Uint8Array;
  loader?: Loader;
}

export interface ResolveResult {
  path?: string;
  external?: boolean;
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

  /**
   * Called when a resolve is requested to this plugin
   * @param args The arguments for the resolve
   * @returns The resolved result
   */
  public async resolve(
    args: OnResolveArgs,
  ): Promise<MaybeFalsey<ResolveResult>> {
    return null;
  }

  /**
   * Called when a build is started
   */
  public async onBuildStart(): Promise<void> {}

  /**
   * Called when a build is ended
   */
  public async onBuildEnd(): Promise<void> {}
}

export function isCompilerPlugin(plugin: unknown): plugin is CompilerPlugin {
  return isPlugin(plugin) && plugin.type === PluginType.Compiler;
}
