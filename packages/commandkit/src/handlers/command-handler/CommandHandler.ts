import type {
  CommandHandlerData,
  CommandHandlerOptions,
  CommandKitInteraction,
} from './typings';
import type { CommandFileObject, ReloadOptions } from '../../typings';

import { toFileURL } from '../../utils/resolve-file-url';
import { getFilePaths } from '../../utils/get-paths';
import { clone } from '../../utils/clone';

import loadCommandsWithRest from './functions/loadCommandsWithRest';
import registerCommands from './functions/registerCommands';
import builtInValidationsFunctions from './validations';
import colors from '../../utils/colors';
import { AsyncLocalStorage } from 'async_hooks';
import type { CommandData } from '../../types';

export interface hCommandContext {
  interaction: CommandKitInteraction;
  command: CommandData;
}

/**
 * A handler for client application commands.
 */
export class CommandHandler {
  #data: CommandHandlerData;
  context: AsyncLocalStorage<hCommandContext> | null = null;

  constructor({ ...options }: CommandHandlerOptions) {
    this.#data = {
      ...options,
      builtInValidations: [],
      commands: [],
    };
  }

  async init() {
    if (this.#data.enableHooks && !this.context) {
      this.context = new AsyncLocalStorage();
    }
    await this.#buildCommands();

    this.#buildBuiltInValidations();

    const devOnlyCommands = this.#data.commands.filter(
      (cmd) => cmd.options?.devOnly,
    );

    if (devOnlyCommands.length && !this.#data.devGuildIds.length) {
      process.emitWarning(
        colors.yellow(
          'You have commands marked as "devOnly", but "devGuildIds" have not been set.',
        ),
      );
    }

    if (
      devOnlyCommands.length &&
      !this.#data.devUserIds.length &&
      !this.#data.devRoleIds.length
    ) {
      process.emitWarning(
        colors.yellow(
          'You have commands marked as "devOnly", but "devUserIds" or "devRoleIds" have not been set.',
        ),
      );
    }

    if (this.#data.bulkRegister) {
      await loadCommandsWithRest({
        client: this.#data.client,
        devGuildIds: this.#data.devGuildIds,
        commands: this.#data.commands,
      });
    } else {
      await registerCommands({
        client: this.#data.client,
        devGuildIds: this.#data.devGuildIds,
        commands: this.#data.commands,
      });
    }

    this.handleCommands();
  }

  async #buildCommands() {
    const allowedExtensions = /\.(js|mjs|cjs|ts)$/i;
    const paths = await getFilePaths(this.#data.commandsPath, true);

    const commandFilePaths = paths.filter((path) =>
      allowedExtensions.test(path),
    );

    for (const commandFilePath of commandFilePaths) {
      const modulePath = toFileURL(commandFilePath);

      const importedObj = await import(`${modulePath}?t=${Date.now()}`);
      let commandObj: CommandFileObject = clone(importedObj); // Make commandObj extensible

      // If it's CommonJS, invalidate the import cache
      if (typeof module !== 'undefined' && typeof require !== 'undefined') {
        delete require.cache[require.resolve(commandFilePath)];
      }

      const compactFilePath =
        commandFilePath.split(process.cwd())[1] || commandFilePath;

      if (commandObj.default)
        commandObj = commandObj.default as CommandFileObject;

      // Ensure builder properties
      if (importedObj.default) {
        commandObj.data = importedObj.default.data;
      } else {
        commandObj.data = importedObj.data;
      }

      if (!commandObj.data) {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command file ${compactFilePath} does not export "data".`,
          ),
        );
        continue;
      }

      if (!commandObj.data.name) {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command file ${compactFilePath} does not export "data.name".`,
          ),
        );
        continue;
      }

      if (!commandObj.run) {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command file ${commandObj.data.name} does not export "run".`,
          ),
        );
        continue;
      }

      if (typeof commandObj.run !== 'function') {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command file ${commandObj.data.name} does not export "run" as a function.`,
          ),
        );
        continue;
      }

      commandObj.filePath = commandFilePath;

      let commandCategory =
        commandFilePath
          .split(this.#data.commandsPath)[1]
          ?.replace(/\\\\|\\/g, '/')
          .split('/')[1] || null;

      if (commandCategory && allowedExtensions.test(commandCategory)) {
        commandObj.category = null;
      } else {
        commandObj.category = commandCategory;
      }

      this.#data.commands.push(commandObj);
    }
  }

  #buildBuiltInValidations() {
    for (const builtInValidationFunction of builtInValidationsFunctions) {
      this.#data.builtInValidations.push(builtInValidationFunction);
    }
  }

  handleCommands() {
    const areHooksEnabled = this.#data.enableHooks;

    this.#data.client.on('interactionCreate', async (interaction) => {
      if (
        !interaction.isChatInputCommand() &&
        !interaction.isContextMenuCommand() &&
        !interaction.isAutocomplete()
      )
        return;

      const isAutocomplete = interaction.isAutocomplete();

      const targetCommand = this.#data.commands.find(
        (cmd) => cmd.data.name === interaction.commandName,
      );

      if (!targetCommand) return;

      const { data, options, run, autocomplete, ...rest } = targetCommand;

      // Skip if autocomplete handler is not defined
      if (isAutocomplete && !autocomplete) return;

      const executor = async () => {
        const commandObj = {
          data: targetCommand.data,
          options: targetCommand.options,
          ...rest,
        };

        if (this.#data.validationHandler) {
          let canRun = true;

          for (const validationFunction of this.#data.validationHandler
            .validations) {
            const stopValidationLoop = await validationFunction({
              interaction,
              commandObj,
              client: this.#data.client,
              handler: this.#data.commandkitInstance,
            });

            if (stopValidationLoop) {
              canRun = false;
              break;
            }
          }

          if (!canRun) return;
        }

        let canRun = true;

        // If custom validations pass and !skipBuiltInValidations, run built-in CommandKit validation functions
        if (!this.#data.skipBuiltInValidations) {
          for (const validation of this.#data.builtInValidations) {
            const stopValidationLoop = validation({
              targetCommand,
              interaction,
              handlerData: this.#data,
            });

            if (stopValidationLoop) {
              canRun = false;
              break;
            }
          }
        }

        if (!canRun) return;

        const command = targetCommand[isAutocomplete ? 'autocomplete' : 'run']!;

        // if hooks are not enabled, pass the context to the command via its arguments
        if (!areHooksEnabled) {
          const context = {
            interaction,
            client: this.#data.client,
            handler: this.#data.commandkitInstance,
          };
          return await command(context);
        }

        // @ts-expect-error - context data is not passed when hooks are enabled
        return command();
      };

      if (this.context)
        return this.context.run(
          {
            command: targetCommand.data,
            interaction,
          },
          executor,
        );
      return executor();
    });
  }

  get commands() {
    return this.#data.commands;
  }

  async reloadCommands(type?: ReloadOptions) {
    if (!this.#data.commandsPath) {
      throw new Error(
        colors.red(
          'Cannot reload commands as "commandsPath" was not provided when instantiating CommandKit.',
        ),
      );
    }

    this.#data.commands = [];

    // Re-build commands tree
    await this.#buildCommands();

    if (this.#data.bulkRegister) {
      await loadCommandsWithRest({
        client: this.#data.client,
        devGuildIds: this.#data.devGuildIds,
        commands: this.#data.commands,
        reloading: true,
        type,
      });
    } else {
      await registerCommands({
        client: this.#data.client,
        devGuildIds: this.#data.devGuildIds,
        commands: this.#data.commands,
        reloading: true,
        type,
      });
    }
  }
}
