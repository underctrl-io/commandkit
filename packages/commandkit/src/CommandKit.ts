import type {
  CommandKitData,
  CommandKitOptions,
  ReloadOptions,
} from './typings';
import type { CommandObject } from './types';

import { CommandHandler, EventHandler, ValidationHandler } from './handlers';

import colors from './utils/colors';

export class CommandKit {
  #data: CommandKitData;
  static _instance: CommandKit | null = null;

  /**
   * Create a new command and event handler with CommandKit.
   *
   * @param options - The default CommandKit configuration.
   * @see {@link https://commandkit.js.org/docs/commandkit-setup}
   */
  constructor(options: CommandKitOptions) {
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

    this.#data = options;
    CommandKit._instance = this;

    this.#init();
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
        enableHooks: this.#data.experimental?.hooks ?? false,
      });

      await commandHandler.init();

      this.#data.commandHandler = commandHandler;
    }
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
}
