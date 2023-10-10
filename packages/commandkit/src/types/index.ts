import type {
    CommandInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    APIApplicationCommandOption,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    UserContextMenuCommandInteraction,
    PermissionResolvable,
    Client,
    RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import type { CommandKit } from '../CommandKit';

export interface CommandProps {
    interaction: CommandInteraction;
    client: Client<true>;
    handler: CommandKit;
}

export interface SlashCommandProps {
    interaction: ChatInputCommandInteraction;
    client: Client<true>;
    handler: CommandKit;
}

export interface ContextMenuCommandProps {
    interaction: ContextMenuCommandInteraction;
    client: Client<true>;
    handler: CommandKit;
}

export interface ValidationFunctionProps {
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
    client: Client<true>;
    commandObj: CommandObject;
    handler: CommandKit;
}

export interface CommandOptions {
    guildOnly?: boolean;
    devOnly?: boolean;
    deleted?: boolean;
    userPermissions?: PermissionResolvable;
    botPermissions?: PermissionResolvable;
    [key: string]: any;
}

export enum CommandType {
    'ChatInput' = 1,
    'Message' = 3,
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

type BaseCommandData = {
    name: string;
    type?: CommandType;
    name_localizations?: Partial<Record<LocaleString, string | null>>;
    dm_permission?: boolean;
    default_member_permissions?: string;
    nsfw?: boolean;
};

type ChatInputCommandData = BaseCommandData & {
    type?: CommandType.ChatInput;
    description: string;
    description_localizations?: Partial<Record<LocaleString, string | null>>;
    options?: Array<APIApplicationCommandOption>;
};

type UserOrMessageCommandData = BaseCommandData & {
    type: CommandType.User | CommandType.Message;
};

export type CommandData = ChatInputCommandData | UserOrMessageCommandData;

export type CommandObject = {
    data: CommandData;
    options?: CommandOptions;
    filePath: string;
    category: string | null;
    [key: string]: any;
};

export enum ReloadType {
    Developer = 'dev',
    Global = 'global',
}

// CommandBuilder Types
export type AnySlashCommandData =
    | CommandData
    | SlashCommandBuilder
    | RESTPostAPIApplicationCommandsJSONBody;

export type SlashCommandRunFunction = (options: SlashCommandProps) => Promise<void> | void;

export type AnyContextCommandData =
    | CommandData
    | RESTPostAPIApplicationCommandsJSONBody
    | ContextMenuCommandBuilder;

export type UserContextCommandRunFunction = (
    options: UserContextCommandProps,
) => Promise<void> | void;

export type MessageContextCommandRunFunction = (
    options: MessageContextCommandProps,
) => Promise<void> | void;

interface UserContextCommandProps {
    client: Client;
    interaction: UserContextMenuCommandInteraction;
    handler: CommandKit;
}

interface MessageContextCommandProps {
    client: Client;
    interaction: MessageContextMenuCommandInteraction;
    handler: CommandKit;
}
