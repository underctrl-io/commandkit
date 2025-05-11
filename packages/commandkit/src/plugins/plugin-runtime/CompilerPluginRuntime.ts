import { readFile } from 'node:fs/promises';
import { CompilerPlugin, MaybeFalsey, TransformedResult } from '..';
import {
  OnLoadArgs,
  OnLoadResult,
  OnResolveArgs,
  OnResolveResult,
  Setup,
} from './types';

const pattern = /\.(c|m)?(t|j)sx?$/;

export class CompilerPluginRuntime {
  public readonly name = 'CompilerPluginRuntime';

  public constructor(private readonly plugins: CompilerPlugin[]) {}

  public getPlugins() {
    return this.plugins;
  }

  public isEmpty() {
    return !this.plugins.length;
  }

  private async onLoad(args: OnLoadArgs): Promise<OnLoadResult> {
    const source = await readFile(args.path, 'utf8');

    let contents: string | Uint8Array = source,
      loader = args.path?.split('.').pop();

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
        await plugin.deactivate?.(this);
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
        await plugin.activate?.(this);
      } catch (e: any) {
        console.error(
          `Plugin ${plugin.name} failed to activate with ${e?.stack || e}`,
        );
      }
    }
  }

  public async cleanup() {
    await this.onEnd();
    await this.onDispose();
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

    build.onEnd(async () => {
      await this.onEnd();
    });

    build.onDispose(async () => {
      await this.onDispose();
    });
  }

  public toEsbuildPlugin() {
    return {
      name: this.name,
      setup: this.setup.bind(this),
    };
  }
}

export function fromEsbuildPlugin(plugin: any): typeof CompilerPlugin {
  class EsbuildPluginCompat extends CompilerPlugin {
    public readonly name = plugin.name;

    public onBuildEnd(): Promise<void> {
      return plugin.onBuildEnd?.();
    }

    public onBuildStart(): Promise<void> {
      return plugin.onBuildStart?.();
    }

    public async transform(params: any) {
      return plugin.transform?.(params);
    }

    public async resolve(params: any) {
      return plugin.resolve?.(params);
    }
  }

  // @ts-ignore
  return EsbuildPluginCompat;
}
