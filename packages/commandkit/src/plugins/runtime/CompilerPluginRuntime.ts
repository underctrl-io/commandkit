import { readFile } from 'node:fs/promises';
import type { CompilerPlugin, MaybeFalsey, TransformedResult } from '..';
import {
  OnLoadArgs,
  OnLoadResult,
  OnResolveArgs,
  OnResolveResult,
  Setup,
} from './types';
import { getConfig } from '../../config';

const pattern = /\.(c|m)?(t|j)sx?$/;

export class CompilerPluginRuntime {
  public readonly name = 'CompilerPluginRuntime';

  public constructor(private readonly plugins: CompilerPlugin[]) {}

  private async onLoad(args: OnLoadArgs): Promise<OnLoadResult> {
    const source = await readFile(args.path, 'utf8');

    let contents: string | Uint8Array = source,
      loader = args.path.split('.').pop();

    for (const plugin of this.plugins) {
      try {
        const res: MaybeFalsey<TransformedResult> = await plugin.transform?.({
          contents,
          path: args.path,
          loader,
          args,
        });

        if (!res) continue;

        if (res.contents) {
          contents = res.contents;
        }

        if (res.loader) {
          loader = res.loader;
        }
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error(e);

        return {
          pluginName: plugin.name,
          errors: [
            {
              text: err.message,
              detail: err?.stack ?? err,
              location: null,
            },
          ],
        };
      }
    }

    return {
      contents,
      loader,
    };
  }

  private async onResolve(args: OnResolveArgs): Promise<OnResolveResult> {
    let result: OnResolveResult = {};

    for (const plugin of this.plugins) {
      try {
        const resolved = await plugin.resolve?.(args);
        if (!resolved) continue;

        result = { ...result, ...resolved };
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error(e);

        return {
          errors: [
            {
              text: err.message,
              detail: err?.stack ?? err,
              location: null,
            },
          ],
        };
      }
    }

    return result;
  }

  private async onStart() {
    for (const plugin of this.plugins) {
      try {
        await plugin.onBuildStart?.();
      } catch (e: any) {
        console.error(
          `Plugin ${plugin.name} failed to run onBuildStart with ${e?.stack || e}`,
        );
      }
    }
  }

  private async onEnd() {
    for (const plugin of this.plugins) {
      try {
        await plugin.onBuildEnd?.();
      } catch (e: any) {
        console.error(
          `Plugin ${plugin.name} failed to run onBuildEnd with ${e?.stack || e}`,
        );
      }
    }
  }

  private async onDispose() {
    for (const plugin of this.plugins) {
      try {
        await plugin.deactivate?.(getConfig());
      } catch (e: any) {
        console.error(
          `Plugin ${plugin.name} failed to deactivate with ${e?.stack || e}`,
        );
      }
    }
  }

  private async onInit() {
    for (const plugin of this.plugins) {
      try {
        await plugin.activate?.(getConfig());
      } catch (e: any) {
        console.error(
          `Plugin ${plugin.name} failed to activate with ${e?.stack || e}`,
        );
      }
    }
  }

  public async setup(build: Setup) {
    if (!this.plugins.length) return;

    await this.onInit();

    await build.onResolve(
      {
        filter: pattern,
      },
      this.onResolve.bind(this),
    );

    await build.onLoad(
      {
        filter: pattern,
      },
      this.onLoad.bind(this),
    );

    await build.onStart(this.onStart.bind(this));

    await build.onEnd(this.onEnd.bind(this));

    await build.onDispose(this.onDispose.bind(this));
  }
}
