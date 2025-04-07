import EventEmitter from 'node:events';
import type { CommandKitOptions } from './types';
import colors from './utils/colors';
import { CacheProvider } from './cache/CacheProvider';
import { MemoryCache } from './cache/MemoryCache';
import { createElement, Fragment } from './components';
import { EventInterceptor } from './components/common/EventInterceptor';
import { Awaitable, Events, Locale, Message } from 'discord.js';
import { findAppDirectory } from './utils/utilities';
import { join } from 'node:path';
import { AppCommandHandler } from './app/handlers/AppCommandHandler';
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
import { GenericFunction } from './context/async-context';
import { AsyncFunction } from './cache';

export interface CommandKitConfiguration {
  defaultLocale: Locale;
  getMessageCommandPrefix: (message: Message) => Awaitable<string | string[]>;
}

// @ts-ignore
export let commandkit: CommandKit;

export type BootstrapFunction =
  | GenericFunction<[CommandKit]>
  | AsyncFunction<[CommandKit]>;

const bootstrapHooks = new Set<BootstrapFunction>();
const onApplicationBootstrapHooks = new Set<BootstrapFunction>();

/**
 * Registers a bootstrap hook that will be called when the CommandKit instance is created.
 * This is useful for plugins that need to run some code after the CommandKit instance is fully initialized.
 * Note that not all commandkit dependiencs are available at this point. It is recommended to use the `onApplicationBootstrap` hook instead,
 * if you need access to the commandkit dependencies.
 * @param fn The bootstrap function to register.
 * @example ```ts
 * import { onBootstrap } from 'commandkit';
 *
 * onBootstrap(async (commandkit) => {
 *   // Do something with the commandkit instance
 * })
 * ```
 */
export function onBootstrap<F extends BootstrapFunction>(fn: F): void {
  bootstrapHooks.add(fn);
}

/**
 * Registers a bootstrap hook that will be called when the CommandKit instance is created.
 * This is useful for plugins that need to run some code after the CommandKit instance is fully initialized.
 * @param fn The bootstrap function to register.
 * @example ```ts
 * import { onApplicationBootstrap } from 'commandkit';
 *
 * onApplicationBootstrap(async (commandkit) => {
 *   // Do something with the commandkit instance
 * })
 * ```
 */
export function onApplicationBootstrap<F extends BootstrapFunction>(
  fn: F,
): void {
  onApplicationBootstrapHooks.add(fn);
}

export class CommandKit extends EventEmitter {
  #started = false;
  public eventInterceptor!: EventInterceptor;

  public static readonly createElement = createElement;
  public static readonly Fragment = Fragment;

  public readonly config: CommandKitConfiguration = {
    defaultLocale: Locale.EnglishUS,
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
  constructor(private readonly options: CommandKitOptions) {
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

    super();

    if (
      options.cacheProvider !== null &&
      (!options.cacheProvider ||
        !(options.cacheProvider instanceof CacheProvider))
    ) {
      options.cacheProvider = new MemoryCache();
    }

    this.plugins = new CommandKitPluginRuntime(this);

    if (!CommandKit.instance) {
      CommandKit.instance = this;
    }

    // @ts-ignore
    commandkit = CommandKit.instance;

    this.#bootstrapHooks();
  }

  async #bootstrapHooks() {
    for (const hook of bootstrapHooks) {
      try {
        await hook(this);
      } catch (e) {
        Logger.error('Error while executing bootstrap hook: ', e);
      } finally {
        bootstrapHooks.delete(hook);
      }
    }

    // force clear just in case we missed something
    bootstrapHooks.clear();
  }

  async #applicationBootstrapHooks() {
    for (const hook of onApplicationBootstrapHooks) {
      try {
        await hook(this);
      } catch (e) {
        Logger.error('Error while executing application bootstrap hook: ', e);
      } finally {
        onApplicationBootstrapHooks.delete(hook);
      }
    }
    // force clear just in case we missed something
    onApplicationBootstrapHooks.clear();
  }

  /**
   * Starts the commandkit application.
   * @param token The application token to connect to the discord gateway. If not provided, it will use the `TOKEN` or `DISCORD_TOKEN` environment variable. If set to `false`, it will not login.
   */
  async start(token?: string | false) {
    if (this.#started) return;

    if (!this.options.client) {
      throw new Error(
        colors.red('"client" is required when starting CommandKit.'),
      );
    }

    this.eventInterceptor = new EventInterceptor(this.client);

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

      await this.plugins.execute((ctx, plugin) => {
        return plugin.onBeforeClientLogin?.(ctx);
      });

      await this.options.client.login(
        token ??
          this.options.client.token ??
          process.env.TOKEN ??
          process.env.DISCORD_TOKEN,
      );

      await this.plugins.execute((ctx, plugin) => {
        return plugin.onAfterClientLogin?.(ctx);
      });
    } else if (this.options.client.isReady()) {
      await this.commandHandler.registrar.register();
    }

    this.#started = true;

    await this.#applicationBootstrapHooks();
  }

  /**
   * Loads all the plugins.
   */
  async loadPlugins() {
    const config = await loadConfigFile();
    const plugins = config.plugins.flat(2).filter((p) => isRuntimePlugin(p));

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
   * Sets the cache provider.
   * @param provider The cache provider.
   */
  setCacheProvider(provider: CacheProvider) {
    if (!(provider instanceof CacheProvider)) {
      throw new Error(
        colors.red('Cache provider must be an instance of CacheProvider.'),
      );
    }

    this.options.cacheProvider = provider;
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

    await this.plugins.execute((ctx, plugin) => {
      return plugin.onCommandsRouterInit(ctx);
    });

    this.eventsRouter = new EventsRouter({
      entrypoints: [events],
    });

    await this.plugins.execute((ctx, plugin) => {
      return plugin.onEventsRouterInit(ctx);
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

    this.commandHandler.printBanner();
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

  getPath(to: 'commands' | 'events') {
    const appDir = this.getAppDirectory();
    if (!appDir) return null;

    switch (to) {
      case 'commands':
        return join(appDir, 'commands');
      case 'events':
        return join(appDir, 'events');
      default:
        return to satisfies never;
    }
  }
}
