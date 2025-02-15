import EventEmitter from 'node:events';
import {
  CommandHandler,
  EventHandler,
  ValidationHandler,
} from './legacy/handlers';
import type {
  CommandKitData,
  CommandKitOptions,
  CommandObject,
  ReloadOptions,
} from './types';
import colors from './utils/colors';
import { CacheProvider } from './cache/CacheProvider';
import { MemoryCache } from './cache/MemoryCache';
import { createElement, Fragment } from './components';
import { EventInterceptor } from './components/common/EventInterceptor';
import { Awaitable, Locale, Message } from 'discord.js';
import { DefaultLocalizationStrategy } from './app/i18n/DefaultLocalizationStrategy';
import { findAppDirectory } from './utils/utilities';
import { join } from 'node:path';
import { AppCommandHandler } from './app/command-handler/AppCommandHandler';
import { LocalizationStrategy } from './app/i18n/LocalizationStrategy';
import { CommandsRouter, EventsRouter } from './app/router';

export interface CommandKitConfiguration {
  defaultLocale: Locale;
  localizationStrategy: LocalizationStrategy;
  getMessageCommandPrefix: (message: Message) => Awaitable<string | string[]>;
}

export class CommandKit extends EventEmitter {
  #data: CommandKitData;
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
  public appCommandsHandler = new AppCommandHandler(this);

  static instance: CommandKit | undefined = undefined;

  /**
   * Create a new command and event handler with CommandKit.
   *
   * @param options - The default CommandKit configuration.
   * @see {@link https://commandkit.js.org/docs/guide/commandkit-setup}
   */
  constructor(options: CommandKitOptions) {
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

    this.#data = options;

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

    await this.#init();

    this.incrementClientListenersCount();

    if (token !== false && !this.#data.client.isReady()) {
      await this.#data.client.login(
        token ?? process.env.TOKEN ?? process.env.DISCORD_TOKEN,
      );
    }

    this.#started = true;
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
    const provider = this.#data.cacheProvider;
    return provider ?? null;
  }

  /**
   * Whether or not to debug the command handler.
   */
  isDebuggingCommands() {
    return this.#data.debugCommands || false;
  }

  /**
   * Get the client attached to this CommandKit instance.
   */
  get client() {
    return this.#data.client;
  }

  /**
   * Get command handler instance.
   */
  get commandHandler() {
    return this.#data.commandHandler;
  }

  /**
   * (Private) Initialize CommandKit.
   */
  async #init() {
    // <!-- Setup event handler -->
    if (this.#data.eventsPath) {
      const eventHandler = new EventHandler({
        client: this.#data.client,
        eventsPath: this.#data.eventsPath,
        commandKitInstance: this,
      });

      await eventHandler.init();

      this.#data.eventHandler = eventHandler;
    }

    // <!-- Setup validation handler -->
    if (this.#data.validationsPath) {
      const validationHandler = new ValidationHandler({
        validationsPath: this.#data.validationsPath,
      });

      await validationHandler.init();

      this.#data.validationHandler = validationHandler;
    }

    // <!-- Setup command handler -->
    if (this.#data.commandsPath) {
      const commandHandler = new CommandHandler({
        client: this.#data.client,
        commandsPath: this.#data.commandsPath,
        devGuildIds: this.#data.devGuildIds || [],
        devUserIds: this.#data.devUserIds || [],
        devRoleIds: this.#data.devRoleIds || [],
        validationHandler: this.#data.validationHandler,
        skipBuiltInValidations: this.#data.skipBuiltInValidations || false,
        commandkitInstance: this,
        bulkRegister: this.#data.bulkRegister || false,
      });

      this.#data.commandHandler = commandHandler;

      await this.#initApp();
      await commandHandler.init();
    }
  }

  async #initApp() {
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
      await this.commandsRouter.scan();
    }

    await this.appCommandsHandler.loadCommands();
  }

  async #initEvents() {
    if (this.eventsRouter.isValidPath()) {
      await this.eventsRouter.scan();
    }

    if (!this.#data.eventHandler) return;

    for (const event of Object.values(this.eventsRouter.toJSON())) {
      this.#data.eventHandler.registerExternal(event);
    }

    this.#data.eventHandler.resyncListeners();
  }

  /**
   * Updates application commands with the latest from "commandsPath".
   */
  async reloadCommands(type?: ReloadOptions) {
    if (!this.#data.commandHandler) return;
    await this.#data.commandHandler.reloadCommands(type);
  }

  /**
   * Updates application events with the latest from "eventsPath".
   */
  async reloadEvents() {
    if (!this.#data.eventHandler) return;
    await this.#data.eventHandler.reloadEvents(this.#data.commandHandler);
  }

  /**
   * Updates application command validations with the latest from "validationsPath".
   */
  async reloadValidations() {
    if (!this.#data.validationHandler) return;
    await this.#data.validationHandler.reloadValidations();
  }

  /**
   * @returns An array of objects of all the commands that CommandKit is handling.
   */
  get commands(): CommandObject[] {
    if (!this.#data.commandHandler) {
      return [];
    }

    const commands = this.#data.commandHandler.commands.map((cmd) => {
      const { run, autocomplete, ...command } = cmd;
      return command;
    });

    return commands;
  }

  /**
   * @returns The path to the commands folder which was set when instantiating CommandKit.
   */
  get commandsPath(): string | undefined {
    return this.#data.commandsPath;
  }

  /**
   * @returns The path to the events folder which was set when instantiating CommandKit.
   */
  get eventsPath(): string | undefined {
    return this.#data.eventsPath;
  }

  /**
   * @returns The path to the validations folder which was set when instantiating CommandKit.
   */
  get validationsPath(): string | undefined {
    return this.#data.validationsPath;
  }

  /**
   * @returns An array of all the developer user IDs which was set when instantiating CommandKit.
   */
  get devUserIds(): string[] {
    return this.#data.devUserIds || [];
  }

  /**
   * @returns An array of all the developer guild IDs which was set when instantiating CommandKit.
   */
  get devGuildIds(): string[] {
    return this.#data.devGuildIds || [];
  }

  /**
   * @returns An array of all the developer role IDs which was set when instantiating CommandKit.
   */
  get devRoleIds(): string[] {
    return this.#data.devRoleIds || [];
  }

  /**
   * Increment the client listeners count.
   */
  incrementClientListenersCount() {
    this.#data.client.setMaxListeners(this.#data.client.getMaxListeners() + 1);
  }

  /**
   * Decrement the client listeners count.
   */
  decrementClientListenersCount() {
    this.#data.client.setMaxListeners(this.#data.client.getMaxListeners() - 1);
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
