import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  ContextMenuCommandInteraction,
} from 'discord.js';
import type { CommandKit } from '../../CommandKit';
import type { CommandFileObject } from '../../types';
import type { ValidationHandler } from '../validation-handler/ValidationHandler';

/**
 * Command handler options.
 * Similar to CommandKit options in structure.
 */
export interface CommandHandlerOptions {
  /**
   * The client created by the user.
   */
  client: Client;

  /**
   * Path to the user's commands.
   */
  commandsPath: string;

  /**
   * An array of developer guild IDs.
   */
  devGuildIds: string[];

  /**
   * An array of developer user IDs.
   */
  devUserIds: string[];

  /**
   * An array of developer role IDs.
   */
  devRoleIds: string[];

  /**
   * A validation handler instance to run validations before commands.
   */
  validationHandler?: ValidationHandler;

  /**
   * A boolean indicating whether to skip CommandKit's built-in validations (permission checking, etc.)
   */
  skipBuiltInValidations: boolean;

  /**
   * The CommandKit handler that instantiated this.
   */
  commandkitInstance: CommandKit;

  /**
   * A boolean indicating whether to register all commands in bulk.
   */
  bulkRegister: boolean;
}

/**
 * Private command handler data.
 */
export interface CommandHandlerData extends CommandHandlerOptions {
  /**
   * An array of command file objects.
   */
  commands: CommandFileObject[];

  /**
   * An array of built-in validations.
   */
  builtInValidations: BuiltInValidation[];

  /**
   * A validation handler instance to run validations before commands.
   */
  validationHandler?: ValidationHandler;
}

/**
 * Parameters for CommandKit's built-in validations.
 */
export interface BuiltInValidationParams {
  /**
   * The target command to validate.
   */
  targetCommand: CommandFileObject;

  /**
   * The interaction of the target command.
   */
  interaction: CommandKitInteraction;

  /**
   * The command handler's data.
   */
  handlerData: CommandHandlerData;
}

/**
 * Represents a command interaction.
 */
export type CommandKitInteraction =
  | ChatInputCommandInteraction
  | ContextMenuCommandInteraction
  | AutocompleteInteraction;

/**
 * A built in validation. Returns a boolean or void.
 */
export type BuiltInValidation = ({}: BuiltInValidationParams) => boolean | void;
