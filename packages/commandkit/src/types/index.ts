import type {
    Client,
    CommandInteraction,
    PermissionResolvable,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    APIApplicationCommandSubcommandOption,
    APIApplicationCommandSubcommandGroupOption,
} from 'discord.js';
import type { CommandKit } from '../CommandKit';
import type { ContextCommandObject, SlashCommandObject } from '../typings';

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
    commandObj: SlashCommandObject | ContextCommandObject;
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

export type CommandData = {
    name: string;
    description: string;
    type?: CommandType;
    name_localizations?: Partial<Record<LocaleString, string | null>>;
    description_localizations?: Partial<Record<LocaleString, string | null>>;
    dm_permission?: boolean;
    default_member_permissions?: string;
    nsfw?: boolean;
    options?: Array<
        APIApplicationCommandSubcommandOption | APIApplicationCommandSubcommandGroupOption
    >;
};

export interface CommandFileObject {
    data: CommandData;
    options?: CommandOptions;
}
