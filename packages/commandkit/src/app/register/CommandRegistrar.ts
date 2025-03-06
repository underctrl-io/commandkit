import { ApplicationCommandType, REST, Routes } from 'discord.js';
import { CommandKit } from '../../CommandKit';
import { CommandData } from '../../types';
import { Logger } from '../../logger/Logger';

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
      const collections: CommandData[] = [json];

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
