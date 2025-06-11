import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  ContextMenuCommandInteraction,
} from 'discord.js';
import type { CommandKit } from 'commandkit';
import { CommandObject } from './loadLegacyCommands.js';
import devOnlyValidation from './validations/devOnly.js';
import permissionValidation from './validations/permissions.js';
import { recursivelyFindFiles } from './common.js';
import type { LegacyHandlerPluginOptions } from './index.js';
import { pathToFileURL } from 'node:url';

type Awaitable<T> = Promise<T> | T;

/**
 * Represents the properties required for validation functions.
 * It includes the client, interaction, command object, and handler.
 */
export interface ValidationProps {
  /**
   * The Discord client instance.
   */
  client: Client<true>;
  /**
   * The interaction that triggered the command.
   */
  interaction:
    | ChatInputCommandInteraction
    | AutocompleteInteraction
    | ContextMenuCommandInteraction;
  /**
   * The command object associated with the interaction.
   */
  commandObj: CommandObject;
  /**
   * The CommandKit handler instance.
   */
  handler: CommandKit;
}

/**
 * Represents a validation function that can be used to validate interactions.
 * It takes a context object containing the client, interaction, command object, and handler.
 * The function should return a boolean indicating whether the validation passed or void if no validation is needed.
 */
export type ValidationFunction = (
  context: ValidationProps,
) => Awaitable<boolean | void>;

/**
 * Represents a validation function that can be loaded from a file.
 * It includes the name of the validation, the path to the file, and the validation function itself.
 */
export interface ValidationFunctionData {
  /**
   * The name of the validation function.
   */
  name: string;
  /**
   * The path to the file where the validation function is defined.
   */
  path: string;
  /**
   * The validation function.
   */
  validate: ValidationFunction;
}

/**
 * @private
 */
export async function loadLegacyValidations(
  path: string,
  options: LegacyHandlerPluginOptions,
  noBuiltIn = false,
) {
  const files = await recursivelyFindFiles(path);

  const validationFunctions: Array<ValidationFunctionData> = [];

  for (const file of files) {
    const filePath = `${pathToFileURL(file.path).href}?ts=${Date.now()}`;
    const { default: validationFunction } = await import(filePath);

    if (typeof validationFunction !== 'function') {
      throw new Error(`Validation function in ${file} is not a valid function`);
    }

    validationFunctions.push({
      name: file.name,
      path: file.path,
      validate: validationFunction,
    });
  }

  if (!noBuiltIn) {
    validationFunctions.push(
      {
        name: 'devOnly',
        path: 'built-in',
        validate: (props: ValidationProps) =>
          devOnlyValidation({
            ...props,
            handlerData: {
              devGuildIds: options.devGuildIds,
              devRoleIds: options.devRoleIds,
              devUserIds: options.devUserIds,
            },
          }),
      },
      {
        name: 'permissions',
        path: 'built-in',
        validate: permissionValidation,
      },
    );
  }

  return {
    validations: validationFunctions,
  };
}
