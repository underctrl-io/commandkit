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

export interface ValidationProps {
  client: Client<true>;
  interaction:
    | ChatInputCommandInteraction
    | AutocompleteInteraction
    | ContextMenuCommandInteraction;
  commandObj: CommandObject;
  handler: CommandKit;
}

export type ValidationFunction = (
  context: ValidationProps,
) => Awaitable<boolean | void>;

export interface ValidationFunctionData {
  name: string;
  path: string;
  validate: ValidationFunction;
}

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
