import { CompilerPlugin, MaybeFalsey, TransformedResult } from '..';

export class CompilerPluginRuntime {
  public readonly name = 'CompilerPluginRuntime';
  private initialized = false;

  public constructor(private readonly plugins: CompilerPlugin[]) {}

  public getPlugins() {
    return this.plugins;
  }

  public isEmpty() {
    return !this.plugins.length;
  }

  public async transform(
    code: string,
    id: string,
  ): Promise<{ code: string; map: string | null }> {
    let map: string | null = null;
    for (const plugin of this.plugins) {
      try {
        const res: MaybeFalsey<TransformedResult> = await plugin.transform?.({
          code,
          id,
        });

        if (!res) continue;

        if (res.code) {
          code = res.code;
        }

        if (res.map) {
          map = res.map;
        }
      } catch (e: any) {
        const err = e instanceof Error ? e : new Error(e);
        throw new Error(
          `Plugin ${plugin.name} failed to transform: ${err.message}`,
        );
      }
    }

    return {
      code,
      map,
    };
  }

  public async init() {
    if (this.initialized) return;

    for (const plugin of this.plugins) {
      try {
        await plugin.activate?.(this);
      } catch (e: any) {
        console.error(
          `Plugin ${plugin.name} failed to activate with ${e?.stack || e}`,
        );
      }
    }

    this.initialized = true;
  }

  public async destroy() {
    if (!this.initialized) return;

    for (const plugin of this.plugins) {
      try {
        await plugin.deactivate?.(this);
      } catch (e: any) {
        console.error(
          `Plugin ${plugin.name} failed to deactivate with ${e?.stack || e}`,
        );
      }
    }

    this.initialized = false;
  }

  public toJSON() {
    return {
      name: this.name,
      transform: this.transform.bind(this),
    };
  }
}
