import i18next from 'i18next';
import type {
  NewableModule,
  Module,
  Newable,
  i18n,
  InitOptions,
} from 'i18next';
import {
  CommandKitPluginRuntime,
  Context as NativeContext,
  Logger,
  RuntimePlugin,
  getCurrentDirectory,
  useEnvironment,
  CommandKitEnvironment,
  CommandSource,
  PreparedAppCommandExecution,
  CommandBuilderLike,
  PreRegisterCommandsEvent,
} from 'commandkit';
import FsBackend from 'i18next-fs-backend';
import { join } from 'path';
import { FsBackendOptions } from 'i18next-fs-backend';
import { Locale } from 'discord.js';
import { existsSync, writeFileSync } from 'fs';

export type Awaitable<T> = Promise<T> | T;

export type LocalizationModule =
  | NewableModule<Module>
  | Module
  | Newable<Module>;

export type DynamicLocalizationModule = () => Awaitable<LocalizationModule>;

export interface LocalizationPluginOptions {
  /**
   * The i18next plugins to use. The plugins are loaded in the order they are
   * specified.
   */
  plugins?: Array<LocalizationModule | DynamicLocalizationModule>;
  /**
   * The options to use
   */
  options?: {
    /**
     * Whether to disable internal i18next fs backend.
     * @default false
     */
    disableFsBackend?: boolean;
    /**
     * The path to load the translation files from.
     * CommandKit will output `.js` even if you use `.json` files.
     * @default '/app/locales/{{lng}}/{{ns}}.js'
     */
    loadPath?: string;
  };
  /**
   * The i18next initialization options.
   * @see https://www.i18next.com/overview/configuration-options
   */
  i18nOptions?: InitOptions;
}

/**
 * Gets the localization context.
 * @param locale The locale to use. Defaults to the detected locale or the default locale.
 */
export function locale(locale?: Locale): CommandLocalizationContext {
  const env = useEnvironment();
  const context = env.context;

  if (!context) {
    throw new Error('No localization context found');
  }

  return context.locale(locale);
}

export interface CommandLocalizationContext {
  /**
   * The i18next instance.
   */
  i18n: i18n;
  /**
   * The localization function bound to the current command.
   * @param key The key to translate.
   * @param options The options to pass to the translation function.
   */
  t: (key: string, options?: Record<string, unknown>) => string;
  /**
   * The locale to use for the command.
   */
  locale: Locale;
}

export interface CommandTranslationMetadata {
  name?: string;
  description?: string;
  options?: (
    | Record<'name' | 'description', string>
    | Record<string, Record<'name' | 'description', string>>
  )[];
}

declare module 'commandkit' {
  export interface LocalizationContext extends CommandLocalizationContext {}

  interface Context {
    /**
     * Returns the localization context for the current command.
     * @param locale The locale to use. Defaults to the detected locale or the default locale.
     */
    locale: (locale?: Locale) => LocalizationContext;
  }
}

NativeContext.prototype.locale = function (locale?: Locale) {
  const env = this.config.environment || useEnvironment();
  const detectedLocale: Locale = locale || this.getLocale();
  const i18n = env.variables.get('i18n:plugin:instance') as i18n;

  if (!i18n) {
    throw new Error('I18n plugin not found in context environment variables');
  }

  return {
    t: i18n.getFixedT(detectedLocale, this.getCommandIdentifier()),
    locale: detectedLocale,
    i18n,
  } satisfies CommandLocalizationContext;
};

const COMMAND_METADATA_KEY = '$command';

const DISCORD_LOCALES = Object.values(Locale).filter(
  (locale) => !/^\d+/.test(locale),
);

export class I18nPlugin extends RuntimePlugin<LocalizationPluginOptions> {
  public readonly name = 'I18nPlugin';
  private i18n!: i18n;

  public async activate(ctx: CommandKitPluginRuntime): Promise<void> {
    this.i18n = i18next;

    if (!this.options.options?.disableFsBackend) {
      this.i18n.use(FsBackend);
    }

    if (this.options.plugins?.length) {
      for (const plugin of this.options.plugins) {
        if (typeof plugin === 'function') {
          const module = await (plugin as DynamicLocalizationModule)();
          this.i18n.use(module);
        } else {
          this.i18n.use(plugin);
        }
      }
    }

    // Setup better debugging
    const debug = this.options.i18nOptions?.debug || false;

    await this.i18n.init({
      initAsync: true,
      fallbackLng: 'en-US',
      debug,
      load: 'currentOnly',
      ...this.options.i18nOptions,
      ...(!this.options.options?.disableFsBackend && {
        backend: this.getBackendOptions(),
      }),
    });

    // Check if we have any languages available
    if (this.i18n.languages.length === 0) {
      Logger.warn(
        'I18nPlugin: No languages loaded. Using default language only.',
      );
    }

    try {
      // Load all languages explicitly
      await this.i18n.loadLanguages(DISCORD_LOCALES);
      Logger.info(
        `I18nPlugin loaded languages: ${this.i18n.languages.join(', ')}`,
      );
    } catch (error) {
      Logger.warn(`I18nPlugin failed to load some languages: ${error}`);
    }

    // Set the default locale for command execution
    ctx.commandkit.config.defaultLocale = (this.i18n.language ||
      'en-US') as Locale;

    Logger.info('I18nPlugin has been activated');
  }

  private getBackendOptions() {
    const { loadPath } = this.options.options ?? {};
    const basePath = getCurrentDirectory();

    return {
      loadPath: function (lng: string, namespace: string) {
        // First try with the configured path
        let path = join(
          basePath,
          (loadPath ?? `/locales/${lng}/${namespace}.js`)
            .replace(/{{lng}}/g, lng)
            .replace(/{{ns}}/g, namespace),
        );

        // Check if path exists, if not try standard locations with different extensions
        if (!existsSync(path)) {
          // Try .json extension
          const jsonPath = path.replace(/\.js$/, '.json');
          if (existsSync(jsonPath)) {
            return jsonPath;
          }

          // Try standard location in locales folder
          const standardPath = join(
            basePath,
            'locales',
            lng,
            `${namespace}.json`,
          );
          if (existsSync(standardPath)) {
            return standardPath;
          }

          // Try .js in standard location as last resort
          const standardJsPath = join(
            basePath,
            'locales',
            lng,
            `${namespace}.js`,
          );
          if (existsSync(standardJsPath)) {
            return standardJsPath;
          }

          // Default to original path, i18next will handle the error
          Logger.debug(
            `No translation file found for ${lng}/${namespace} in any location`,
          );
        }

        return path;
      },
      addPath: function (lng: string, namespace: string) {
        let path = join(
          basePath,
          (loadPath ?? `/locales/${lng}/${namespace}.json`)
            .replace(/{{lng}}/g, lng)
            .replace(/{{ns}}/g, namespace),
        );

        // Always prefer JSON for writing new translations
        if (path.endsWith('.js')) {
          path = path.replace(/\.js$/, '.json');
        }

        // Make sure path is in locales directory
        if (!path.includes(`${basePath}/locales/`)) {
          path = join(basePath, 'locales', lng, `${namespace}.json`);
        }

        return path;
      },
    } satisfies FsBackendOptions;
  }

  /**
   * Helper to check if a resource exists and log details about it
   */
  private verifyResource(namespace: string, locale: string): boolean {
    const debug = this.options.i18nOptions?.debug || false;

    // Check if namespace is loaded
    if (!this.i18n.hasResourceBundle(locale, namespace)) {
      if (debug) {
        Logger.debug(`No resource bundle found for ${namespace} (${locale})`);
      }
      return false;
    }

    // Get and verify the resource
    const resource = this.i18n.getResourceBundle(locale, namespace);
    if (!resource) {
      if (debug) {
        Logger.debug(`Empty resource bundle for ${namespace} (${locale})`);
      }
      return false;
    }

    // Check for command metadata
    if (!resource[COMMAND_METADATA_KEY]) {
      if (debug) {
        Logger.debug(`Missing command metadata in ${namespace} (${locale})`);
        Logger.debug(`Resource keys: ${Object.keys(resource).join(', ')}`);
      }
      return false;
    }

    return true;
  }

  public async executeCommand(
    ctx: CommandKitPluginRuntime,
    env: CommandKitEnvironment,
    source: CommandSource,
    command: PreparedAppCommandExecution,
    execute: () => Promise<any>,
  ): Promise<boolean> {
    env.variables.set('i18n:plugin:instance', this.i18n);

    await execute();

    return true;
  }

  public async prepareCommand(
    ctx: CommandKitPluginRuntime,
    command: CommandBuilderLike,
  ): Promise<CommandBuilderLike | null> {
    const data = 'toJSON' in command ? command.toJSON() : command;
    const debug = this.options.i18nOptions?.debug || false;

    try {
      // Explicitly load the namespace for the command
      await this.i18n.loadNamespaces(command.name);
    } catch (error) {
      if (debug) {
        Logger.error(
          `Failed to load resources for command ${command.name}: ${error}`,
        );
      }
    }

    for (const locale of DISCORD_LOCALES) {
      // Check if the namespace is actually loaded and retry loading if needed
      if (!this.i18n.hasResourceBundle(locale, command.name)) {
        // Try to load it again specifically for this locale
        try {
          await this.i18n.loadNamespaces([command.name]);
          if (debug)
            Logger.debug(
              `Loaded namespace ${command.name} for locale ${locale}`,
            );
        } catch (error) {
          if (debug) {
            Logger.debug(
              `Cannot load namespace ${command.name} for locale ${locale}: ${error}`,
            );
          }
          continue; // Skip this locale if we can't load resources for it
        }
      }

      // Use our verification helper to check resource validity
      if (!this.verifyResource(command.name, locale)) {
        continue; // Skip if resource is invalid
      }

      // Get the translation resources
      const resources = this.i18n.getResourceBundle(locale, command.name);

      // Get the command metadata from the resources
      const metadata = resources[
        COMMAND_METADATA_KEY
      ] as CommandTranslationMetadata;
      const { description, name, options } = metadata;

      if (data.name && name) {
        data.name_localizations ??= {};
        data.name_localizations[locale] = name;
      }

      if (data.description && description) {
        data.description_localizations ??= {};
        data.description_localizations[locale] = description;
      }

      if (data.options?.length && options?.length) {
        // recursively apply translation patch to each option if needed
        const applyTranslation = (
          option: Record<string, unknown>,
          translation:
            | Record<string, string>
            | Record<string, Record<string, string>>,
          optionName?: string,
        ) => {
          // Handle nested translation format (Record<string, Record<'name' | 'description', string>>)
          if (
            optionName &&
            typeof translation === 'object' &&
            translation[optionName] &&
            typeof translation[optionName] === 'object'
          ) {
            // Use the nested translation that matches this option's name
            const nestedTranslation = translation[optionName] as Record<
              string,
              string
            >;

            for (const [key, value] of Object.entries(nestedTranslation)) {
              if (key !== 'name' && key !== 'description') continue;

              if (option[key]) {
                option[`${key}_localizations`] ??= {};
                (option[`${key}_localizations`] as Record<string, string>)[
                  locale
                ] = value;
              }
            }
          }
          // Handle direct translation format (Record<'name' | 'description', string>)
          else if (typeof translation === 'object') {
            for (const [key, value] of Object.entries(
              translation as Record<string, string>,
            )) {
              if (key !== 'name' && key !== 'description') continue;

              if (option[key]) {
                option[`${key}_localizations`] ??= {};
                (option[`${key}_localizations`] as Record<string, string>)[
                  locale
                ] = value;
              }
            }
          }
        };

        for (const [index, option] of data.options.entries()) {
          if (index >= options.length) break; // Avoid out of bounds access

          const translation = options[index];
          const optionName = option.name as string;

          if (Array.isArray(option) && option.length) {
            for (const opt of option) {
              applyTranslation(opt, translation, opt.name as string);
            }
          } else {
            applyTranslation(option, translation, optionName);
          }
        }
      }
    }

    return data;
  }

  public async onBeforeRegisterCommands(
    ctx: CommandKitPluginRuntime,
    event: PreRegisterCommandsEvent,
  ): Promise<void> {
    event.preventDefault();

    writeFileSync(
      `./.commandkit/cmd.json`,
      JSON.stringify(event.commands, null, 2),
    );
  }
}
