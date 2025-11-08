import { BaseBuilder, createBaseBuilderConfig } from '@workflow/builders';
import { Logger } from 'commandkit';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export interface LocalBuilderOptions {
  /**
   * The output directory to use for the builder.
   */
  outDir: string;
  /**
   * The input paths.
   */
  inputPaths: string[];
}

export class LocalBuilder extends BaseBuilder {
  #outDir: string;
  public constructor(private options: LocalBuilderOptions) {
    const outDir = join(process.cwd(), options.outDir, '.compiled-workflows');
    super({
      ...createBaseBuilderConfig({
        workingDir: process.cwd(),
        watch: false,
        dirs: options.inputPaths.map((path) =>
          join(process.cwd(), 'src', path),
        ),
      }),
      buildTarget: 'next', // Placeholder, not actually used
    });
    this.#outDir = outDir;
  }

  override async build(): Promise<void> {
    const inputFiles = await this.getInputFiles();
    await mkdir(this.#outDir, { recursive: true });

    const workflowPath = join(this.#outDir, 'workflows.js');
    const stepsPath = join(this.#outDir, 'steps.js');
    const webhookPath = join(this.#outDir, 'webhook.js');

    await this.createWorkflowsBundle({
      outfile: workflowPath,
      bundleFinalOutput: false,
      format: 'esm',
      inputFiles,
    });

    await this.createStepsBundle({
      outfile: stepsPath,
      externalizeNonSteps: true,
      format: 'esm',
      inputFiles,
    });

    await this.createWebhookBundle({
      outfile: webhookPath,
      bundle: false,
    });

    await this.generateHandler({
      workflow: workflowPath,
      steps: stepsPath,
      webhook: webhookPath,
    });
  }

  public getHandlerPath(): string {
    return join(import.meta.dirname, 'public-handler.js');
  }

  private async generateHandler({
    workflow,
    steps,
    webhook,
  }: {
    workflow: string;
    steps: string;
    webhook: string;
  }): Promise<void> {
    const handlerPath = join(import.meta.dirname, 'handler.js');
    const source = await readFile(handlerPath, 'utf-8');
    await writeFile(
      this.getHandlerPath(),
      source
        .replace('{{workflowPath}}', pathToFileURL(workflow).toString())
        .replace('{{stepsPath}}', pathToFileURL(steps).toString())
        .replace('{{webhookPath}}', pathToFileURL(webhook).toString()),
    );
    Logger.debug`Generated workflow handler at ${handlerPath}`;
  }
}
