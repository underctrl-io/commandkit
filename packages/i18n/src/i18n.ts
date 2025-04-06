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
import { basename, extname, join } from 'path';
import { FsBackendOptions } from 'i18next-fs-backend';
import { Locale } from 'discord.js';
import { existsSync, writeFileSync } from 'fs';
import { CommandTranslation, CommandTranslationMetadata } from './types';
import { COMMAND_METADATA_KEY, DISCORD_LOCALES } from './constants';
import { applyTranslations } from './utils';
import { readdir } from 'fs/promises';

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

export class I18nPlugin extends RuntimePlugin<LocalizationPluginOptions> {
  public readonly name = 'I18nPlugin';
  private i18n!: i18n;
  private metadata = new Map<string, CommandTranslationMetadata>();

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

    const { namespaces, languages } = await this.scanLocaleDirectory();

    await this.i18n.init({
      initAsync: true,
      fallbackLng: 'en-US',
      debug,
      ns: namespaces,
      preload: languages,
      load: 'all',
      initImmediate: false,
      interpolation: {
        escapeValue: false,
        skipOnVariables: false,
      },
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

    // Set the default locale for command execution
    ctx.commandkit.config.defaultLocale = (this.i18n.language ||
      'en-US') as Locale;

    Logger.info('I18nPlugin has been activated');
  }

  private getLoadPath() {
    return join(
      getCurrentDirectory(),
      this.options.options?.loadPath ?? '/app/locales/{{lng}}/{{ns}}.js',
    );
  }

  private async scanLocaleDirectory() {
    const endPattern = /{{lng}}(\/|\\){{ns}}.(c|m)?js(on)?$/;
    const localesPath = this.getLoadPath();
    const scanDirTarget = localesPath.replace(endPattern, '');

    if (!existsSync(scanDirTarget)) {
      Logger.warn(
        `I18nPlugin: No locales directory found at ${scanDirTarget}. Skipping scan.`,
      );

      return { namespaces: [], languages: [] };
    }

    const namespaces = new Set<string>();
    const languages = new Set<string>();

    const files = await readdir(scanDirTarget, { withFileTypes: true });

    for (const file of files) {
      const isValidLocale = DISCORD_LOCALES.has(file.name as Locale);
      if (file.isDirectory()) {
        if (!isValidLocale) {
          Logger.warn(`I18nPlugin: Invalid locale directory ${file.name}`);
          continue;
        }

        languages.add(file.name);

        const files = await readdir(join(scanDirTarget, file.name), {
          withFileTypes: true,
        });

        for (const file of files) {
          if (file.isFile()) {
            const ext = extname(file.name);

            if (!/\.js(on)?$/.test(ext)) continue;

            const name = basename(file.name, ext);
            namespaces.add(name);

            const locale = basename(file.parentPath);

            await this.loadMetadata(
              join(file.parentPath, file.name),
              locale,
              name,
            );
          }
        }
      } else if (file.isFile()) {
        const ext = extname(file.name);

        if (!/\.js(on)?$/.test(ext)) continue;

        const name = basename(file.name, ext);
        namespaces.add(name);

        const locale = basename(file.parentPath);

        await this.loadMetadata(join(file.parentPath, file.name), locale, name);
      }
    }

    return {
      namespaces: Array.from(namespaces),
      languages: Array.from(languages),
    };
  }

  private async loadMetadata(
    filePath: string,
    locale: string,
    name: string,
  ): Promise<void> {
    try {
      const translationResource = require(filePath);
      // const translationResource = await import(
      //   pathToFileURL(filePath).toString()
      // )
      //   .then((mod) => mod.default || mod, console.error)
      //   .catch(() => null);

      const translation: CommandTranslation =
        translationResource.default || translationResource;

      if (!translation) return;

      if (translation.translations) {
        this.i18n.addResources(locale, name, translation.translations);
      }

      const metadata = translation[COMMAND_METADATA_KEY];

      if (metadata) {
        this.metadata.set(`${locale}:${name}`, metadata);
      }
    } catch {}
  }

  private getBackendOptions() {
    const loadPath = this.getLoadPath();

    return {
      loadPath: function (lng: string, namespace: string) {
        const path = loadPath
          .replace(/{{lng}}/g, lng)
          .replace(/{{ns}}/g, namespace);

        if (!existsSync(path)) {
          return path.replace(/\.js$/, '.json');
        }

        return path;
      },
    } satisfies FsBackendOptions;
  }

  public async executeCommand(
    ctx: CommandKitPluginRuntime,
    env: CommandKitEnvironment,
    source: CommandSource,
    command: PreparedAppCommandExecution,
  ): Promise<boolean> {
    env.variables.set('i18n:plugin:instance', this.i18n);

    return false;
  }

  public async prepareCommand(
    ctx: CommandKitPluginRuntime,
    command: CommandBuilderLike,
  ): Promise<CommandBuilderLike | null> {
    const data = 'toJSON' in command ? command.toJSON() : command;

    for (const locale of DISCORD_LOCALES) {
      try {
        const translation = this.metadata.get(`${locale}:${data.name}`);

        if (!translation) continue;

        applyTranslations(data, locale, translation);
      } catch (e) {
        console.log(e);
        continue;
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
