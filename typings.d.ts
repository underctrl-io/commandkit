import {
  Client,
  APIApplicationCommandOption,
  ContextMenuCommandType,
  Interaction,
  PermissionResolvable,
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from 'discord.js';

export interface CommandKitOptions {
  client: Client;
  commandsPath?: string;
  eventsPath?: string;
  validationsPath?: string;
  devGuildIds?: string[];
  devUserIds?: string[];
}

export interface CommandKitData extends CommandKitOptions {
  commands: Array<SlashCommandObject | ContextCommandObject>;
}

export interface SlashCommandObject {
  data:
    | SlashCommandBuilder
    | {
        name: string;
        name_localizations?: any;
        description: string;
        dm_permission?: boolean;
        options?: APIApplicationCommandOption[];
      };
  options?: {
    guildOnly?: boolean;
    devOnly?: boolean;
    deleted?: boolean;
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
  };
  run: ({}: { interaction: Interaction; client: Client }) => void;
}

export interface ContextCommandObject {
  data:
    | ContextMenuCommandBuilder
    | {
        name: string;
        name_localizations?: any;
        type: ContextMenuCommandType;
        dm_permission?: boolean;
      };
  options?: {
    guildOnly?: boolean;
    devOnly?: boolean;
    deleted?: boolean;
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
  };
  run: ({}: { interaction: Interaction; client: Client }) => void;
}
