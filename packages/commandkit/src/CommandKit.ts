import EventEmitter from 'node:events';
import type { CommandKitOptions } from './types';
import colors from './utils/colors';
import { CacheProvider } from './cache/CacheProvider';
import { MemoryCache } from './cache/MemoryCache';
import { createElement, Fragment } from './components';
import { EventInterceptor } from './components/common/EventInterceptor';
import { Awaitable, Events, Locale, Message } from 'discord.js';
import { DefaultLocalizationStrategy } from './app/i18n/DefaultLocalizationStrategy';
import { findAppDirectory } from './utils/utilities';
import { join } from 'node:path';
import { AppCommandHandler } from './app/handlers/AppCommandHandler';
import { LocalizationStrategy } from './app/i18n/LocalizationStrategy';
import { CommandsRouter, EventsRouter } from './app/router';
import { AppEventsHandler } from './app/handlers/AppEventsHandler';
import { CommandKitPluginRuntime } from './plugins/runtime/CommandKitPluginRuntime';
import { loadConfigFile } from './config/loader';
import { COMMANDKIT_IS_DEV } from './utils/constants';
import { registerDevHooks } from './utils/dev-hooks';
import { writeFileSync } from 'node:fs';
import { CommandKitEventsChannel } from './events/CommandKitEventsChannel';
import { isRuntimePlugin } from './plugins';
import { generateTypesPackage } from './utils/types-package';
import { Logger } from './logger/Logger';

export interface CommandKitConfiguration {
  defaultLocale: Locale;
  localizationStrategy: LocalizationStrategy;
  getMessageCommandPrefix: (message: Message) => Awaitable<string | string[]>;
}

export class CommandKit extends EventEmitter {
  #started = false;
  public readonly eventInterceptor: EventInterceptor;

  public static readonly createElement = createElement;
  public static readonly Fragment = Fragment;

  public readonly config: CommandKitConfiguration = {
    defaultLocale: Locale.EnglishUS,
    localizationStrategy: new DefaultLocalizationStrategy(this),
    getMessageCommandPrefix: () => '!',
  };

  public commandsRouter!: CommandsRouter;
  public eventsRouter!: EventsRouter;
  public readonly commandHandler = new AppCommandHandler(this);
  public readonly eventHandler = new AppEventsHandler(this);
  public readonly plugins: CommandKitPluginRuntime;
  public readonly events = new CommandKitEventsChannel(this);

  static instance: CommandKit | undefined = undefined;

  /**
   * Create a new command and event handler with CommandKit.
   *
   * @param options - The default CommandKit configuration.
   * @see {@link https://commandkit.js.org/docs/guide/commandkit-setup}
   */
  constructor(private options: CommandKitOptions) {
    if (CommandKit.instance) {
      process.emitWarning(
        'CommandKit instance already exists. Having multiple instance in same project is discouraged and it may lead to unexpected behavior.',
        {
          code: 'MultiInstanceWarning',
        },
      );
    }

    if (!options.client) {
      throw new Error(
        colors.red('"client" is required when instantiating CommandKit.'),
      );
    }

    if (options.validationsPath && !options.commandsPath) {
      throw new Error(
        colors.red('"commandsPath" is required when "validationsPath" is set.'),
      );
    }

    super();

    options.debugCommands ??= process.env.NODE_ENV !== 'production';

    if (
      options.cacheProvider !== null &&
      (!options.cacheProvider ||
        !(options.cacheProvider instanceof CacheProvider))
    ) {
      options.cacheProvider = new MemoryCache();
    }

    this.eventInterceptor = new EventInterceptor(options.client);
    this.plugins = new CommandKitPluginRuntime(this);

    if (!CommandKit.instance) {
      CommandKit.instance = this;
    }
  }

  /**
   * Starts the commandkit application.
   * @param token The application token to connect to the discord gateway. If not provided, it will use the `TOKEN` or `DISCORD_TOKEN` environment variable. If set to `false`, it will not login.
   */
  async start(token?: string | false) {
    if (this.#started) return;

    if (COMMANDKIT_IS_DEV) {
      try {
        registerDevHooks(this);

        await generateTypesPackage();
      } catch (e) {
        // ignore
        if (process.env.COMMANDKIT_DEBUG_TYPEGEN) {
          Logger.error(e);
        }
      }
    }

    await this.loadPlugins();

    await this.#init();

    this.commandHandler.registerCommandHandler();
    this.incrementClientListenersCount();

    if (token !== false && !this.options.client.isReady()) {
      this.client.once(Events.ClientReady, async () => {
        await this.commandHandler.registrar.register();
      });

      await this.options.client.login(
        token ?? process.env.TOKEN ?? process.env.DISCORD_TOKEN,
      );
    } else if (this.options.client.isReady()) {
      await this.commandHandler.registrar.register();
    }

    this.#started = true;
  }

  /**
   * Loads all the plugins.
   */
  async loadPlugins() {
    const config = await loadConfigFile();
    const plugins = config.plugins.filter((p) => isRuntimePlugin(p));

    if (!plugins.length) return;

    for (const plugin of plugins) {
      await this.plugins.softRegisterPlugin(plugin);
    }
  }

  /**
   * Whether or not the commandkit application has started.
   */
  get started() {
    return this.#started;
  }

  /**
   * Sets the prefix resolver for the command handler.
   * @param resolver The resolver function.
   */
  setPrefixResolver(
    resolver: (message: Message) => Awaitable<string | string[]>,
  ) {
    this.config.getMessageCommandPrefix = resolver;
    return this;
  }

  /**
   * Sets the default locale for the command handler.
   * @param locale The default locale.
   */
  setDefaultLocale(locale: Locale) {
    this.config.defaultLocale = locale;
    return this;
  }

  /**
   * Sets the localization strategy for the command handler.
   * @param strategy The localization strategy.
   */
  setLocalizationStrategy(strategy: LocalizationStrategy) {
    this.config.localizationStrategy = strategy;
    return this;
  }

  /**
   * Resolves the current cache provider.
   */
  getCacheProvider(): CacheProvider | null {
    const provider = this.options.cacheProvider;
    return provider ?? null;
  }

  /**
   * Whether or not to debug the command handler.
   */
  isDebuggingCommands() {
    return this.options.debugCommands || false;
  }

  /**
   * Get the client attached to this CommandKit instance.
   */
  get client() {
    return this.options.client;
  }

  async #init() {
    const appDir = this.getAppDirectory();
    if (!appDir) return;

    const commandsPath = this.getPath('commands')!;
    const events = this.getPath('events')!;

    this.commandsRouter = new CommandsRouter({
      entrypoint: commandsPath,
    });

    this.eventsRouter = new EventsRouter({
      entrypoint: events,
    });

    await this.#initEvents();
    await this.#initCommands();
  }

  async #initCommands() {
    if (this.commandsRouter.isValidPath()) {
      const result = await this.commandsRouter.scan();

      if (COMMANDKIT_IS_DEV) {
        writeFileSync(
          './.commandkit/commands.json',
          JSON.stringify(result, null, 2),
        );
      }
    }

    await this.commandHandler.loadCommands();
  }

  async #initEvents() {
    if (this.eventsRouter.isValidPath()) {
      await this.eventsRouter.scan();
    }

    await this.eventHandler.loadEvents();
  }

  /**
   * Updates application commands with the latest from "commandsPath".
   */
  async reloadCommands() {
    await this.commandHandler.reloadCommands();
  }

  /**
   * Updates application events with the latest from "eventsPath".
   */
  async reloadEvents() {
    await this.eventHandler.reloadEvents();
  }

  /**
   * @returns The path to the commands folder which was set when instantiating CommandKit.
   */
  get commandsPath(): string | undefined {
    return this.options.commandsPath;
  }

  /**
   * @returns The path to the events folder which was set when instantiating CommandKit.
   */
  get eventsPath(): string | undefined {
    return this.options.eventsPath;
  }

  /**
   * @returns The path to the validations folder which was set when instantiating CommandKit.
   */
  get validationsPath(): string | undefined {
    return this.options.validationsPath;
  }

  /**
   * @returns An array of all the developer user IDs which was set when instantiating CommandKit.
   */
  get devUserIds(): string[] {
    return this.options.devUserIds || [];
  }

  /**
   * @returns An array of all the developer guild IDs which was set when instantiating CommandKit.
   */
  get devGuildIds(): string[] {
    return this.options.devGuildIds || [];
  }

  /**
   * @returns An array of all the developer role IDs which was set when instantiating CommandKit.
   */
  get devRoleIds(): string[] {
    return this.options.devRoleIds || [];
  }

  /**
   * Increment the client listeners count.
   */
  incrementClientListenersCount() {
    this.options.client.setMaxListeners(
      this.options.client.getMaxListeners() + 1,
    );
  }

  /**
   * Decrement the client listeners count.
   */
  decrementClientListenersCount() {
    this.options.client.setMaxListeners(
      this.options.client.getMaxListeners() - 1,
    );
  }

  /**
   * Path to the app directory. Returns `null` if not found.
   * The lookup order is:
   * - `./app`
   * - `./src/app`
   */
  getAppDirectory() {
    return findAppDirectory();
  }

  getPath(to: 'locales' | 'commands' | 'events') {
    const appDir = this.getAppDirectory();
    if (!appDir) return null;

    switch (to) {
      case 'locales':
        return join(appDir, 'locales');
      case 'commands':
        return join(appDir, 'commands');
      case 'events':
        return join(appDir, 'events');
      default:
        return to satisfies never;
    }
  }
}
