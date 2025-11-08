import { BaseBuilder, createBaseBuilderConfig } from '@workflow/builders';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

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
    const outDir = join(options.outDir, '.compiled-workflows');
    super({
      ...createBaseBuilderConfig({
        workingDir: process.cwd(),
        watch: false,
        dirs: options.inputPaths.map((path) =>
          join(process.cwd(), options.outDir, path),
        ),
      }),
      buildTarget: 'next', // Placeholder, not actually used
    });
    this.#outDir = outDir;
  }

  override async build(): Promise<void> {
    const inputFiles = await this.getInputFiles();
    await mkdir(this.#outDir, { recursive: true });

    await this.createWorkflowsBundle({
      outfile: join(this.#outDir, 'workflows.js'),
      bundleFinalOutput: false,
      format: 'esm',
      inputFiles,
    });

    await this.createStepsBundle({
      outfile: join(this.#outDir, 'steps.js'),
      externalizeNonSteps: true,
      format: 'esm',
      inputFiles,
    });

    await this.createWebhookBundle({
      outfile: join(this.#outDir, 'webhook.js'),
      bundle: false,
    });

    await this.generateHandler();
  }

  public getHandlerPath(): string {
    return join(this.#outDir, 'handler.js');
  }

  private async generateHandler(): Promise<void> {
    const handlerPath = this.getHandlerPath();
    const source = await readFile(handlerPath, 'utf-8');
    await writeFile(handlerPath, source);
  }
}
