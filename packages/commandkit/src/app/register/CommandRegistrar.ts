import {
  ApplicationCommandType,
  REST,
  Routes,
  ApplicationCommandOptionType,
  APIApplicationCommandOption,
  APIApplicationCommandSubcommandGroupOption,
} from 'discord.js';
import { CommandKit } from '../../CommandKit';
import { CommandData } from '../../types';
import { Logger } from '../../logger/Logger';
import { ParsedSubCommand } from '../router/CommandsRouter';

export class CommandRegistrar {
  private api = new REST();

  /**
   * Creates an instance of CommandRegistrar.
   * @param commandkit The commandkit instance.
   */
  public constructor(public readonly commandkit: CommandKit) {
    this.api.setToken(
      this.commandkit.client.token ??
        process.env.DISCORD_TOKEN ??
        process.env.TOKEN ??
        '',
    );
  }

  /**
   * Gets the commands data.
   */
  public getCommandsData(): CommandData[] {
    const commands = this.commandkit.commandHandler.getCommandsArray();

    return commands.flatMap((cmd) => {
      const json: CommandData =
        'toJSON' in cmd.data.command
          ? cmd.data.command.toJSON()
          : cmd.data.command;

      // Process subcommands if they exist and this is a chat input command
      if (
        cmd.subcommands &&
        cmd.subcommands.length > 0 &&
        (!json.type || json.type === ApplicationCommandType.ChatInput)
      ) {
        this.processSubcommands(json, cmd.subcommands);
      }

      const collections: CommandData[] = [json];

      // Handle context menu commands
      if (
        cmd.data.userContextMenu &&
        json.type !== ApplicationCommandType.User
      ) {
        collections.push({
          ...json,
          type: ApplicationCommandType.User,
          options: undefined,
          description_localizations: undefined,
          // @ts-ignore
          description: undefined,
        });
      }

      if (
        cmd.data.messageContextMenu &&
        json.type !== ApplicationCommandType.Message
      ) {
        collections.push({
          ...json,
          type: ApplicationCommandType.Message,
          description_localizations: undefined,
          // @ts-ignore
          description: undefined,
          options: undefined,
        });
      }

      return collections;
    });
  }

  /**
   * Process and merge subcommands into the parent command's options
   */
  private processSubcommands(
    commandData: CommandData,
    subcommands: ParsedSubCommand[],
  ) {
    // Initialize options array if it doesn't exist
    if (!commandData.options) {
      commandData.options = [];
    }

    // Group subcommands by their group (if any)
    const groupedSubcommands = new Map<string | null, ParsedSubCommand[]>();

    // First, organize subcommands by their group
    for (const subcommand of subcommands) {
      const group = subcommand.group || null;
      if (!groupedSubcommands.has(group)) {
        groupedSubcommands.set(group, []);
      }
      groupedSubcommands.get(group)?.push(subcommand);
    }

    // Process subcommands without groups (direct subcommands)
    const directSubcommands = groupedSubcommands.get(null) || [];
    for (const subcommand of directSubcommands) {
      const subcommandData = this.commandkit.commandHandler.getSubcommandData(
        subcommand.id,
      );
      if (subcommandData) {
        // Convert to option format for Discord API
        const subcommandOption = {
          type: 1, // SUB_COMMAND
          name: subcommand.name,
          description: subcommandData.description || 'No description provided',
          options: subcommandData.options || [],
          name_localizations: subcommandData.name_localizations,
          description_localizations: subcommandData.description_localizations,
        };

        commandData.options.push(subcommandOption);
      }
    }

    // Process subcommand groups
    for (const [groupName, groupSubcommands] of groupedSubcommands.entries()) {
      if (groupName === null) continue; // Skip null group (handled above)

      // Create subcommand group
      const subcommandGroupOption: APIApplicationCommandSubcommandGroupOption =
        {
          type: ApplicationCommandOptionType.SubcommandGroup, // SUB_COMMAND_GROUP
          name: groupName,
          description: `${groupName} commands`,
          options: [],
        };

      // Add subcommands to the group
      for (const subcommand of groupSubcommands) {
        const subcommandData = this.commandkit.commandHandler.getSubcommandData(
          subcommand.id,
        );
        if (subcommandData) {
          subcommandGroupOption.options?.push({
            type: ApplicationCommandOptionType.Subcommand, // SUB_COMMAND
            name: subcommand.name,
            description:
              subcommandData.description || 'No description provided',
            options: subcommandData.options || [],
            name_localizations: subcommandData.name_localizations,
            description_localizations: subcommandData.description_localizations,
          });
        }
      }

      // Add group to command options if it has subcommands
      if ((subcommandGroupOption.options?.length || 0) > 0) {
        commandData.options.push(subcommandGroupOption);
      }
    }
  }

  /**
   * Registers loaded commands.
   */
  public async register() {
    const commands = this.getCommandsData();
    const guildCommands = commands.filter((command) => command.guilds?.length);
    const globalCommands = commands.filter(
      (command) => !command.guilds?.length,
    );

    await this.updateGlobalCommands(globalCommands);
    await this.updateGuildCommands(guildCommands);
  }

  /**
   * Updates the global commands.
   */
  public async updateGlobalCommands(commands: CommandData[]) {
    if (!commands.length) return;

    try {
      const data = (await this.api.put(
        Routes.applicationCommands(this.commandkit.client.user!.id),
        {
          body: commands.map((c) => ({
            ...c,
            guilds: undefined,
          })),
        },
      )) as CommandData[];

      Logger.info(
        `✨ Refreshed ${data.length} global application (/) commands`,
      );
    } catch (e) {
      Logger.error('Failed to update global application (/) commands', e);
    }
  }

  /**
   * Updates the guild commands.
   */
  public async updateGuildCommands(commands: CommandData[]) {
    try {
      const guildCommandsMap = new Map<string, CommandData[]>();

      commands.forEach((command) => {
        if (!command.guilds?.length) return;

        command.guilds.forEach((guild) => {
          if (!guildCommandsMap.has(guild)) {
            guildCommandsMap.set(guild, []);
          }

          guildCommandsMap.get(guild)!.push(command);
        });
      });

      if (!guildCommandsMap.size) return;

      let count = 0;

      for (const [guild, guildCommands] of guildCommandsMap) {
        const data = (await this.api.put(
          Routes.applicationGuildCommands(
            this.commandkit.client.user!.id,
            guild,
          ),
          {
            body: guildCommands.map((b) => ({
              ...b,
              guilds: undefined,
            })),
          },
        )) as CommandData[];

        count += data.length;
      }

      Logger.info(`✨ Refreshed ${count} guild application (/) commands`);
    } catch (e) {
      Logger.error('Failed to update guild application (/) commands', e);
    }
  }
}
