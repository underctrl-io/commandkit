import type {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  Client,
  ContextMenuCommandInteraction,
  Interaction,
  MessageContextMenuCommandInteraction,
  PermissionsString,
  RESTPostAPIApplicationCommandsJSONBody,
  UserContextMenuCommandInteraction,
} from 'discord.js';

import type { CommandKit } from './CommandKit';

import { CacheProvider } from './cache/CacheProvider';

/**
 * Options for instantiating a CommandKit handler.
 */
export interface CommandKitOptions {
  /**
   * The Discord.js client object to use with CommandKit.
   */
  client: Client;
  /**
   * The path to your commands directory.
   */
  commandsPath?: string;
  /**
   * The path to your events directory.
   */
  eventsPath?: string;
  /**
   * The path to the validations directory.
   */
  validationsPath?: string;
  /**
   * List of development guild IDs to restrict devOnly commands to.
   */
  devGuildIds?: string[];
  /**
   * List of developer user IDs to restrict devOnly commands to.
   */
  devUserIds?: string[];
  /**
   * List of developer role IDs to restrict devOnly commands to.
   */
  devRoleIds?: string[];
  /**
   * Skip CommandKit's built-in validations (for devOnly commands).
   */
  skipBuiltInValidations?: boolean;
  /**
   * Bulk register application commands instead of one-by-one.
   */
  bulkRegister?: boolean;
  /**
   * Whether or not to debug the command handler.
   */
  debugCommands?: boolean;
  /**
   * The cache provider to use with CommandKit. Defaults to MemoryCache provider.
   * Set this to `null` to not use any cache provider.
   */
  cacheProvider?: CacheProvider | null;
}

/**
 * Represents a command context.
 */
export interface CommandContext<
  T extends Interaction,
  Cached extends CacheType,
> {
  /**
   * The interaction that triggered this command.
   */
  interaction: Interaction<CacheType>;
  /**
   * The client that instantiated this command.
   */
  client: Client;
  /**
   * The command data.
   */
  handler: CommandKit;
}

/**
 * Represents a command file.
 */
export interface CommandFileObject {
  data: CommandData;
  options?: CommandOptions;
  run: <Cached extends CacheType = CacheType>(
    ctx: CommandContext<Interaction, Cached>,
  ) => Awaited<void>;
  autocomplete?: <Cached extends CacheType = CacheType>(
    ctx: CommandContext<Interaction, Cached>,
  ) => Awaited<void>;
  filePath: string;
  category: string | null;
  [key: string]: any;
}

/**
 * A reload type for commands.
 */
export type ReloadOptions = 'dev' | 'global' | ReloadType;

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

export type CommandData = RESTPostAPIApplicationCommandsJSONBody & {
  guilds?: string[];
};

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
