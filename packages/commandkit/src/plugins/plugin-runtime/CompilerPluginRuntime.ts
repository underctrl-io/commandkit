import {
  CompilerPlugin,
  MaybeFalsey,
  TransformedResult,
  TemplateHandler,
  isCompilerPlugin,
} from '..';
import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Interface representing a template entry in the plugin runtime.
 * It contains a handler function for the template and the plugin that owns it.
 * @private
 */
interface TemplateEntry {
  handler: TemplateHandler;
  plugin: CompilerPlugin;
}

/**
 * Enum representing the execution mode of a plugin.
 * It can be either 'activate' or 'deactivate'.
 * @private
 */
enum PluginExecutionMode {
  Activate = 'activate',
  Deactivate = 'deactivate',
}

/**
 * Context for the plugin execution, containing the plugin and its execution mode.
 * This is used to manage the state of the plugin during activation and deactivation.
 * @private
 */
type PluginContext = {
  plugin: CompilerPlugin;
  mode: PluginExecutionMode;
};

/**
 * CompilerPluginRuntime is a runtime for managing compiler plugins in CommandKit.
 */
export class CompilerPluginRuntime {
  public readonly name = 'CompilerPluginRuntime';
  private initialized = false;
  private templates = new Map<string, TemplateEntry>();
  #pluginContext = new AsyncLocalStorage<PluginContext>();

  /**
   * Creates a new instance of CompilerPluginRuntime.
   * @param plugins An array of compiler plugins to be managed by this runtime.
   */
  public constructor(private readonly plugins: CompilerPlugin[]) {
    this.plugins = this.plugins.filter((p) => !!p && isCompilerPlugin(p));
  }

  /**
   * Returns the plugins managed by this runtime.
   */
  public getPlugins() {
    return this.plugins;
  }

  /**
   * Checks if there are no plugins registered in this runtime.
   */
  public isEmpty() {
    return !this.plugins.length;
  }

  /**
   * Registers a template handler for a given name.
   * This method must be called inside the activate() method of a plugin.
   * @param name - The name of the template to register.
   * @param handler - The handler function for the template.
   */
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

  /**
   * Unregisters a template handler for a given name.
   * This method must be called inside the deactivate() method of a plugin.
   * @param name - The name of the template to unregister.
   */
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

  /**
   * Retrieves a template handler by its name.
   * @param name - The name of the template to retrieve.
   * @returns The template handler if found, otherwise undefined.
   */
  public getTemplate(name: string): TemplateHandler | undefined {
    return this.templates.get(name)?.handler;
  }

  /**
   * Returns a map of all registered templates with their handlers.
   * The keys are the template names and the values are the template handlers.
   */
  public getTemplates(): Map<string, TemplateHandler> {
    return new Map(
      Array.from(this.templates.entries()).map(([name, entry]) => [
        name,
        entry.handler,
      ]),
    );
  }

  /**
   * Transforms the given code using all registered plugins.
   * Each plugin's transform method is called in sequence, allowing them to modify the code.
   * @param code - The code to be transformed.
   * @param id - The identifier for the code being transformed (e.g., filename).
   * @returns An object containing the transformed code and an optional source map.
   */
  public async transform(
    code: string,
    id: string,
  ): Promise<{ code: string; map: string | null }> {
    let map: string | null = null;
    for (const plugin of this.plugins) {
      if (!plugin?.transform || typeof plugin?.transform !== 'function') {
        continue;
      }

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

  /**
   * Initializes the plugin runtime by activating all registered plugins.
   * This method should be called once to set up the plugins.
   */
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

  /**
   * Destroys the plugin runtime by deactivating all registered plugins.
   * This method should be called when the runtime is no longer needed.
   */
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

  /**
   * Converts the plugin runtime to a JSON representation.
   * This is useful for serialization or debugging purposes.
   * @returns An object containing the name of the runtime and the transform method.
   */
  public toJSON() {
    return {
      name: this.name,
      transform: this.transform.bind(this),
    };
  }
}
