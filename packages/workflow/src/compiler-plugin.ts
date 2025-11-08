import {
  CompilerPlugin,
  CompilerPluginRuntime,
  getConfig,
  MaybeFalsey,
  PluginTransformParameters,
  TransformedResult,
} from 'commandkit';
import { LocalBuilder } from './builder.js';
import { workflowRollupPlugin } from 'workflow/rollup';

export interface WorkflowCompilerPluginOptions {}

export class WorkflowCompilerPlugin extends CompilerPlugin<WorkflowCompilerPluginOptions> {
  public readonly name = 'WorkflowCompilerPlugin';
  private builder: LocalBuilder | null = null;
  private workflowRollupPlugin: ReturnType<typeof workflowRollupPlugin> | null =
    null;

  public async activate(ctx: CompilerPluginRuntime): Promise<void> {
    this.builder = new LocalBuilder({
      inputPaths: ['workflows', 'app/workflows'],
      outDir: ctx.isDevMode ? '.commandkit' : getConfig().distDir,
    });
    this.workflowRollupPlugin = workflowRollupPlugin();
  }

  public async deactivate(): Promise<void> {
    await this.builder?.build();
    this.builder = null;
  }

  public async transform(
    params: PluginTransformParameters,
  ): Promise<MaybeFalsey<TransformedResult>> {
    if (!/(use workflow)|(use step)/.test(params.code)) return;
    return this.workflowRollupPlugin?.transform(params.code, params.id);
  }
}
