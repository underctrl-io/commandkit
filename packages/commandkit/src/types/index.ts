import type {
  RESTPostAPIApplicationCommandsJSONBody,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  ContextMenuCommandInteraction,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  PermissionsString,
  Client,
} from 'discord.js';
import type { CommandKit } from '../CommandKit';

/**
 * Props for command run functions.
 */
export interface CommandProps {
  /**
   * The current command interaction object.
   */
  interaction:
    | ChatInputCommandInteraction
    | ContextMenuCommandInteraction
    | UserContextMenuCommandInteraction
    | MessageContextMenuCommandInteraction
    | AutocompleteInteraction;

  /**
   * The Discord.js client object that CommandKit is handling.
   */
  client: Client<true>;

  /**
   * The current CommandKit handler instance.
   */
  handler: CommandKit;
}

/**
 * Props for autocomplete command run functions.
 */
export interface AutocompleteProps extends CommandProps {
  /**
   * The current autocomplete command interaction object.
   */
  interaction: AutocompleteInteraction;
}

/**
 * Props for slash (chat input) command run functions.
 */
export interface SlashCommandProps extends CommandProps {
  /**
   * The current slash (chat input) command interaction object.
   */
  interaction: ChatInputCommandInteraction;
}

/**
 * Props for context menu command run functions.
 */
export interface ContextMenuCommandProps extends CommandProps {
  /**
   * The current context menu command interaction object.
   */
  interaction: ContextMenuCommandInteraction;
}

/**
 * Props for user context menu command run functions.
 */
export interface UserContextMenuCommandProps extends CommandProps {
  interaction: UserContextMenuCommandInteraction;
}

/**
 * Props for message context menu command run functions.
 */
export interface MessageContextMenuCommandProps extends CommandProps {
  interaction: MessageContextMenuCommandInteraction;
}

/**
 * Props for command validation functions.
 */
export interface ValidationProps {
  /**
   * The current command interaction object.
   */
  interaction:
    | ChatInputCommandInteraction
    | ContextMenuCommandInteraction
    | AutocompleteInteraction;

  /**
   * The Discord.js client object that CommandKit is handling.
   */
  client: Client<true>;

  /**
   * The current (local) target command object.
   */
  commandObj: CommandObject;

  /**
   * The current CommandKit handler instance.
   */
  handler: CommandKit;
}

/**
 * Additional command configuration options.
 */
export interface CommandOptions {
  /**
   * A boolean indicating whether the command is guild-only.
   * Used for built-in validation.
   *
   * @deprecated Use `dm_permission` in the command's `data` object instead.
   */
  guildOnly?: boolean;

  /**
   * A boolean indicating whether the command is developer-only.
   * Used for registration and built-in validation.
   */
  devOnly?: boolean;

  /**
   * A boolean indicating whether the command is deleted/ignored on restart/reload.
   */
  deleted?: boolean;

  /**
   * A string or array of permissions that a user needs for the current command to be executed.
   * Used for built-in validation.
   *
   * @example
   * userPermissions: 'BanMembers'
   * or
   * userPermissions: ['BanMembers', 'KickMembers']
   */
  userPermissions?: PermissionsString | PermissionsString[];

  /**
   * A string or array of permissions that the bot needs to execute the current command.
   * Used for built-in validation.
   *
   * @example
   * botPermissions: 'BanMembers'
   * or
   * botPermissions: ['BanMembers', 'KickMembers']
   */
  botPermissions?: PermissionsString | PermissionsString[];

  [key: string]: any;
}

export type CommandData = RESTPostAPIApplicationCommandsJSONBody;

export type CommandObject = {
  /**
   * An object which defines the structure of the application command.
   */
  data: CommandData;

  /**
   * Additional command configuration options.
   */
  options?: CommandOptions;

  /**
   * The path to the command file.
   */
  filePath: string;

  /**
   * The command's category. Determined based on the command folder.
   *
   * @example
   * ```txt
   * "/src/commands/ping.js" -> null
   * "/src/commands/Misc/ping.js" -> "Misc"
   * ```
   */
  category: string | null;

  [key: string]: any;
};

export enum ReloadType {
  /**
   * Reload developer/guild commands.
   */
  Developer = 'dev',

  /**
   * Reload global commands.
   */
  Global = 'global',
}
