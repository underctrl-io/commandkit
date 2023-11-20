import type {
    Client,
    CommandInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    APIApplicationCommandOption,
    PermissionsString,
} from 'discord.js';
import type { CommandKit } from '../CommandKit';
import { CommandFileObject } from '../typings';

/**
 * Base props for commands.
 */
export interface CommandProps {
    /**
     * Represents the command's interaction.
     */
    interaction: CommandInteraction;

    /**
     * The client created in your main file.
     */
    client: Client<true>;

    /**
     * The main CommandKit handler that instantiated this.
     */
    handler: CommandKit;
}

/**
 * Props for slash command run functions.
 */
export interface SlashCommandProps {
    /**
     * Represents the command's interaction.
     */
    interaction: ChatInputCommandInteraction;

    /**
     * The client created in your main file.
     */
    client: Client<true>;

    /**
     * The CommandKit handler that instantiated this.
     */
    handler: CommandKit;
}

/**
 * Props for context menu command run functions.
 */
export interface ContextMenuCommandProps {
    /**
     * Represents the command's interaction.
     */
    interaction: ContextMenuCommandInteraction;

    /**
     * The client created in your main file.
     */
    client: Client<true>;

    /**
     * The CommandKit handler that instantiated this.
     */
    handler: CommandKit;
}

/**
 * Props for command validations.
 */
export interface ValidationFunctionProps {
    /**
     * Represents the command's interaction.
     * Either a slash command or a context menu command interaction.
     */
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;

    /**
     * The client created in your main file.
     * Represented as a ready client (`Client<true>`).
     */
    client: Client<true>;

    /**
     * The command object that is being validated.
     */
    commandObj: CommandObject;

    /**
     * The CommandKit handler that instantiated this.
     */
    handler: CommandKit;
}

/**
 * Configuration for commands.
 */
export interface CommandOptions {
    /**
     * Boolean indicating whether the command is guild-only.
     * @deprecated - Use `dm_permission` in the command's data instead.
     */
    guildOnly?: boolean;

    /**
     * Boolean indicating whether the command is developer only.
     */
    devOnly?: boolean;

    /**
     * Boolean indicating whether the command is deleted and should not be registered.
     */
    deleted?: boolean;

    /**
     * An array of user permissions.
     *
     * @example
     * userPermissions: ['BanMembers']
     */
    userPermissions?: PermissionsString[];

    /**
     * An array of bot permissions.
     *
     * @example
     * botPermissions: ['BanMembers']
     */
    botPermissions?: PermissionsString[];
    [key: string]: any;
}

export enum CommandType {
    /**
     * Slash commands.
     */
    'ChatInput' = 1,

    /**
     * Message context menu commands.
     */
    'Message' = 3,

    /**
     * User context menu commands.
     */
    'User' = 2,
}

type LocaleString =
    | 'id'
    | `en-${'GB' | 'US'}`
    | 'bg'
    | `zh-${'CN' | 'TW'}`
    | 'hr'
    | 'cs'
    | 'da'
    | 'nl'
    | 'fi'
    | 'fr'
    | 'de'
    | 'el'
    | 'hi'
    | 'hu'
    | 'it'
    | 'ja'
    | 'ko'
    | 'lt'
    | 'no'
    | 'pl'
    | 'pt-BR'
    | 'ro'
    | 'ru'
    | 'es-ES'
    | 'sv-SE'
    | 'th'
    | 'tr'
    | 'uk'
    | 'vi';

/**
 * Common items for command data.
 */
type BaseCommandData = {
    /**
     * The name of the command.
     */
    name: string;

    /**
     * The type of the command.
     */
    type?: CommandType;

    /**
     * i18n for the command name.
     */
    name_localizations?: Partial<Record<LocaleString, string | null>>;

    /**
     * Whether to allow this command in DMs.
     */
    dm_permission?: boolean;

    /**
     * Default permissions for members for the command.
     */
    default_member_permissions?: string;

    /**
     * Whether the command is age-restricted.
     */
    nsfw?: boolean;
};

/**
 * Data for chat input commands.
 */
type ChatInputCommandData = BaseCommandData & {
    /**
     * The command's type.
     */
    type?: CommandType.ChatInput;

    /**
     * The description of the command.
     */
    description: string;

    /**
     * i18n for the command description.
     */
    description_localizations?: Partial<Record<LocaleString, string | null>>;

    /**
     * Chat input command options.
     */
    options?: Array<APIApplicationCommandOption>;
};

/**
 * Represents any context menu command data.
 */
type UserOrMessageCommandData = BaseCommandData & {
    type: CommandType.User | CommandType.Message;
};

export type CommandData = ChatInputCommandData | UserOrMessageCommandData;

export type CommandObject = {
    /**
     * Command data which is a slash command builder or raw JSON data.
     * @example
     * {
     *      name: 'ping',
     *      description: 'Replies with Pong!'
     * }
     */
    data: CommandData;

    /**
     * CommandKit command options.
     * @example
     * {
     *      devOnly: true,
     *      userPermissions: ['ManageGuild'],
     *      botPermissions: ['ManageGuild'],
     * }
     */
    options?: CommandOptions;

    /**
     * The path to the command file.
     */
    filePath: string;

    /**
     * The command's category.
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
