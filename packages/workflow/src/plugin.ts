import { RuntimePlugin } from 'commandkit';

export interface WorkflowPluginOptions {}

export class WorkflowPlugin extends RuntimePlugin<WorkflowPluginOptions> {
  public readonly name = 'WorkflowPlugin';

  public constructor(options: WorkflowPluginOptions) {
    super(options);
    this.preload.add('module:@commandkit/workflow/handler');
  }
}
