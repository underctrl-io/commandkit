import type {
    Client,
    CommandInteraction,
    PermissionResolvable,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    APIApplicationCommandOption,
} from 'discord.js';
import type { CommandKit } from '../CommandKit';
import type { CommandFileObject } from '../dev-types';

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
    | 'en-US'
    | 'en-GB'
    | 'bg'
    | 'zh-CN'
    | 'zh-TW'
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

export type CommandObject = Omit<CommandFileObject, 'run'>;
