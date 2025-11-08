import {
  WorkflowCompilerPlugin,
  WorkflowCompilerPluginOptions,
} from './compiler-plugin.js';
import { WorkflowPlugin, WorkflowPluginOptions } from './plugin.js';

export interface CommonWorkflowPluginOptions {
  /**
   * The options for the workflow compiler plugin.
   */
  compilerPluginOptions?: WorkflowCompilerPluginOptions;
  /**
   * The options for the workflow runtime plugin.
   */
  runtimePluginOptions?: WorkflowPluginOptions;
}

/**
 * Creates a new workflow plugin.
 * @param options The options for the workflow plugin.
 * @returns The workflow plugin.
 */
export function workflow(options?: CommonWorkflowPluginOptions) {
  return [
    new WorkflowCompilerPlugin(options ?? {}),
    new WorkflowPlugin(options ?? {}),
  ];
}
