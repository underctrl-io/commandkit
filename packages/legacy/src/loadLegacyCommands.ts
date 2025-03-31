import type { CommandKit } from 'commandkit';
import {
  ApplicationCommandType,
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type Client,
  type MessageContextMenuCommandInteraction,
  type PermissionsString,
  type RESTPostAPIApplicationCommandsJSONBody,
  type UserContextMenuCommandInteraction,
} from 'discord.js';
import { readdir } from 'node:fs/promises';
import { FILE_EXTENSIONS } from './common.js';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export type CommandData = RESTPostAPIApplicationCommandsJSONBody;

export interface CommandObject {
  category: string | null;
  data: CommandData;
  filePath: string;
  options: CommandOptions;
}

export interface CommandOptions {
  botPermissions?: PermissionsString[];
  deleted?: boolean;
  devOnly?: boolean;
  guildOnly?: boolean;
  userPermissions?: PermissionsString[];
}

export type CommandRunner<T> = ({}: CommandProps<T>) =>
  | Promise<unknown>
  | unknown;

export interface CommandFileData {
  data: CommandData;
  options?: CommandOptions;
  chatInput: CommandRunner<ChatInputCommandInteraction>;
  messageContextMenu?: CommandRunner<MessageContextMenuCommandInteraction>;
  userContextMenu?: CommandRunner<UserContextMenuCommandInteraction>;
  autocomplete?: CommandRunner<AutocompleteInteraction>;
  category: string | null;
  path: string;
}

interface CommandProps<T> {
  interaction: T;
  client: Client;
  handler: CommandKit;
}

export type SlashCommandProps = CommandProps<ChatInputCommandInteraction>;
export type AutocompleteProps = CommandProps<AutocompleteInteraction>;
export type ContextMenuCommandProps =
  CommandProps<MessageContextMenuCommandInteraction>;

export async function loadLegacyCommands(path: string) {
  const content = await readdir(path, { withFileTypes: true });
  const commandFiles: CommandFileData[] = [];

  for (const entry of content) {
    if (entry.isFile()) {
      if (!FILE_EXTENSIONS.test(entry.name)) continue;
      const data = await loadCommand({
        name: entry.name,
        path: join(path, entry.name),
      });

      commandFiles.push(data);
    } else if (entry.isDirectory()) {
      const sub = await readdir(join(path, entry.name), {
        withFileTypes: true,
      });

      if (sub.length === 0) continue;

      const files = sub.filter(
        (entry) => entry.isFile() && FILE_EXTENSIONS.test(entry.name),
      );

      if (files.length === 0) continue;

      for (const file of files) {
        const data = await loadCommand(file, entry.name);
        commandFiles.push(data);
      }
    }
  }

  return commandFiles;
}

async function loadCommand(
  entry: { name: string; path: string },
  category: string | null = null,
): Promise<CommandFileData> {
  const cmd = await import(`${pathToFileURL(entry.path)}?ts=${Date.now()}`);

  const dataSource = cmd.default || cmd;

  const { data, options, run, autocomplete } = dataSource;

  if (!data) {
    throw new Error(`Command ${entry.name} does not export a data property`);
  }

  if (!run && !autocomplete) {
    throw new Error(
      `Command ${entry.name} does not export a run or autocomplete property`,
    );
  }

  const type =
    data instanceof SlashCommandBuilder ? data.toJSON().type : data.type;

  const isMessageContextMenu = type === ApplicationCommandType.Message;
  const isUserContextMenu = type === ApplicationCommandType.User;

  return {
    category,
    chatInput: run,
    autocomplete: autocomplete ? autocomplete : undefined,
    messageContextMenu: isMessageContextMenu ? run : undefined,
    userContextMenu: isUserContextMenu ? run : undefined,
    data: 'toJSON' in data ? data.toJSON() : data,
    options,
    path: entry.path,
  };
}
