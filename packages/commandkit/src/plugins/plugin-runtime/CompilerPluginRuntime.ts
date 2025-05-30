import {
  CompilerPlugin,
  MaybeFalsey,
  TransformedResult,
  TemplateHandler,
} from '..';
import { AsyncLocalStorage } from 'node:async_hooks';

interface TemplateEntry {
  handler: TemplateHandler;
  plugin: CompilerPlugin;
}

enum PluginExecutionMode {
  Activate = 'activate',
  Deactivate = 'deactivate',
}

type PluginContext = {
  plugin: CompilerPlugin;
  mode: PluginExecutionMode;
};

export class CompilerPluginRuntime {
  public readonly name = 'CompilerPluginRuntime';
  private initialized = false;
  private templates = new Map<string, TemplateEntry>();
  #pluginContext = new AsyncLocalStorage<PluginContext>();

  public constructor(private readonly plugins: CompilerPlugin[]) {}

  public getPlugins() {
    return this.plugins;
  }

  public isEmpty() {
    return !this.plugins.length;
  }

  public registerTemplate(name: string, handler: TemplateHandler) {
    const ctx = this.#pluginContext.getStore();

    if (!ctx || ctx.mode !== PluginExecutionMode.Activate) {
      throw new Error(
        'registerTemplate() must be called inside activate() method',
      );
    }

    if (this.templates.has(name)) {
      throw new Error(`Template "${name}" already exists`);
    }

    this.templates.set(name, { handler, plugin: ctx.plugin });
  }

  public unregisterTemplate(name: string) {
    const ctx = this.#pluginContext.getStore();

    if (!ctx || ctx.mode !== PluginExecutionMode.Deactivate) {
      throw new Error(
        'unregisterTemplate() must be called inside deactivate() method',
      );
    }

    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template "${name}" does not exist`);
    }

    if (template.plugin !== ctx.plugin) {
      throw new Error(
        `Template "${name}" is owned by plugin "${template.plugin.name}" and cannot be unregistered by "${ctx.plugin.name}"`,
      );
    }

    this.templates.delete(name);
  }

  public getTemplate(name: string): TemplateHandler | undefined {
    return this.templates.get(name)?.handler;
  }

  public getTemplates(): Map<string, TemplateHandler> {
    return new Map(
      Array.from(this.templates.entries()).map(([name, entry]) => [
        name,
        entry.handler,
      ]),
    );
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
        await this.#pluginContext.run(
          {
            plugin,
            mode: PluginExecutionMode.Activate,
          },
          async () => {
            await plugin.activate?.(this);
          },
        );
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
        await this.#pluginContext.run(
          {
            plugin,
            mode: PluginExecutionMode.Deactivate,
          },
          async () => {
            await plugin.deactivate?.(this);
          },
        );
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
