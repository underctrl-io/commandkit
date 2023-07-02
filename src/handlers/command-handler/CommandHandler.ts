import { Guild, GuildApplicationCommandManager } from 'discord.js';
import { getFilePaths } from '../../utils/get-paths';
import { CommandHandlerData, CommandHandlerOptions } from './typings';
import { ContextCommandObject, SlashCommandObject } from '../../../typings';

export class CommandHandler {
  _data: CommandHandlerData;

  constructor({ ...options }: CommandHandlerOptions) {
    this._data = {
      ...options,
      commands: [],
    };

    this._init();
  }

  _init() {
    this._buildCommands();
    this._registerCommands();
    this._handleCommands();
  }

  _buildCommands() {
    const commandFilePaths = getFilePaths(this._data.commandsPath, true).filter(
      (path) => path.endsWith('.js') || path.endsWith('.ts')
    );

    for (const commandFilePath of commandFilePaths) {
      const commandObj: SlashCommandObject | ContextCommandObject = require(commandFilePath);

      if (!commandObj.data) {
        console.log(`⏩ Ignoring: Command ${commandFilePath} does not export "data".`);
        continue;
      }

      if (!commandObj.run) {
        console.log(`⏩ Ignoring: Command ${commandFilePath} does not export "run".`);
        continue;
      }

      this._data.commands.push(commandObj);
    }
  }

  _registerCommands() {
    const client = this._data.client;
    const commands = this._data.commands;

    client.once('ready', async () => {
      const devGuilds: Guild[] = [];

      for (const devGuildId of this._data.devGuildIds) {
        const guild = client.guilds.cache.get(devGuildId);

        if (!guild) {
          console.log(
            `⏩ Ignoring: Guild ${devGuildId} does not exist or client isn't in this guild.`
          );
          continue;
        }

        devGuilds.push(guild);
      }

      const appCommands = client.application?.commands;
      await appCommands?.fetch();

      const devGuildCommands: GuildApplicationCommandManager[] = [];

      for (const guild of devGuilds) {
        const guildCommands = guild.commands;
        await guildCommands?.fetch();
        devGuildCommands.push(guildCommands);
      }

      for (const command of commands) {
        // <!-- Delete command if options.deleted -->
        if (command.options?.deleted) {
          const targetCommand = appCommands?.cache.find((cmd) => cmd.name === command.data.name);

          if (!targetCommand) {
            console.log(
              `⏩ Ignoring: Command "${command.data.name}" is globally marked as deleted.`
            );
          } else {
            targetCommand.delete().then(() => {
              console.log(`🚮 Deleted command "${command.data.name}" globally.`);
            });
          }

          for (const guildCommands of devGuildCommands) {
            const targetCommand = guildCommands.cache.find((cmd) => cmd.name === command.data.name);

            if (!targetCommand) {
              console.log(
                `⏩ Ignoring: Command "${command.data.name}" is marked as deleted for ${guildCommands.guild.name}.`
              );
            } else {
              targetCommand.delete().then(() => {
                console.log(
                  `🚮 Deleted command "${command.data.name}" in ${guildCommands.guild.name}.`
                );
              });
            }
          }

          continue;
        }

        // <!-- Edit command if there's any changes -->
        let commandData = command.data;
        let editedCommand = false;

        (() => {
          // global
          const appGlobalCommand = appCommands?.cache.find((cmd) => cmd.name === command.data.name);

          if (appGlobalCommand) {
            const commandsAreDifferent = this._areSlashCommandsDifferent(
              appGlobalCommand,
              commandData
            );

            if (commandsAreDifferent) {
              appGlobalCommand
                .edit(commandData)
                .then(() => {
                  console.log(`✅ Edited command "${commandData.name}" globally.`);
                })
                .catch((error) => {
                  console.log(`❌ Failed to edit command "${commandData.name}" globally.`);
                  console.error(error);
                });

              editedCommand = true;
            }
          }

          // guilds
          for (const guildCommands of devGuildCommands) {
            const appGuildCommand = guildCommands.cache.find(
              (cmd) => cmd.name === commandData.name
            );

            if (appGuildCommand) {
              const commandsAreDifferent = this._areSlashCommandsDifferent(
                appGuildCommand,
                commandData
              );

              if (commandsAreDifferent) {
                appGuildCommand
                  .edit(commandData)
                  .then(() => {
                    console.log(
                      `✅ Edited command "${commandData.name}" in ${guildCommands.guild.name}.`
                    );
                  })
                  .catch((error) => {
                    console.log(
                      `❌ Failed to edit command "${commandData.name}" in ${guildCommands.guild.name}.`
                    );
                    console.error(error);
                  });

                editedCommand = true;
              }
            }
          }
        })();

        if (editedCommand) continue;

        // <!-- Registration -->
        // guild-based command registration
        if (command.options?.devOnly) {
          if (!devGuilds.length) {
            console.log(
              `⏩ Ignoring: Cannot register command "${command.data.name}" as no valid "devGuildIds" were provided.`
            );
            continue;
          }

          for (const guild of devGuilds) {
            const cmdExists = guild.commands.cache.some((cmd) => cmd.name === command.data.name);
            if (cmdExists) continue;

            guild?.commands
              .create(command.data)
              .then(() => {
                console.log(`✅ Registered command "${command.data.name}" in ${guild.name}.`);
              })
              .catch((error) => {
                console.log(
                  `❌ Failed to register command "${command.data.name}" in ${guild.name}.`
                );
                console.error(error);
              });
          }
        }
        // global command registration
        else {
          const cmdExists = appCommands?.cache.some((cmd) => cmd.name === command.data.name);
          if (cmdExists) continue;

          appCommands
            ?.create(command.data)
            .then(() => {
              console.log(`✅ Registered command "${command.data.name}" globally.`);
            })
            .catch((error) => {
              console.log(`❌ Failed to register command "${command.data.name}" globally.`);
              console.error(error);
            });
        }
      }
    });
  }

  _handleCommands() {
    const client = this._data.client;

    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

      const targetCommand = this._data.commands.find(
        (cmd) => cmd.data.name === interaction.commandName
      );

      if (!targetCommand) return;

      // Options validation
      // options.guildOnly
      if (targetCommand.options?.guildOnly && !interaction.inGuild()) {
        interaction.reply({
          content: '❌ This command can only be used inside a server.',
          ephemeral: true,
        });
        return;
      }

      // options.devOnly
      if (targetCommand.options?.devOnly) {
        const isDevUser = this._data.devUserIds.includes(interaction.user.id);

        if (!isDevUser) {
          interaction.reply({
            content: '❌ This command can only be used by developers.',
            ephemeral: true,
          });
          return;
        }
      }

      // options.userPermissions
      const memberPermissions = interaction.memberPermissions;
      if (targetCommand.options?.userPermissions && memberPermissions) {
        for (const permission of targetCommand.options.userPermissions) {
          const hasPermission = memberPermissions.has(permission);

          if (!hasPermission) {
            interaction.reply({
              content: `❌ You do not have enough permission to run this command. Required permission: \`${permission}\``,
              ephemeral: true,
            });
            return;
          }
        }
      }

      // options.botPermissions
      const botMember = interaction.guild?.members.me;

      if (targetCommand.options?.botPermissions && botMember) {
        for (const permission of targetCommand.options.botPermissions) {
          const hasPermission = botMember.permissions.has(permission);

          if (!hasPermission) {
            interaction.reply({
              content: `❌ I do not have enough permission to execute this command. Required permission: \`${permission}\``,
              ephemeral: true,
            });
            return;
          }
        }
      }

      // Run user validation functions
      const validationFunctions = this._data.validations;

      const { data, options, run, ...rest } = targetCommand;

      const commandObj = {
        data: targetCommand.data,
        options: targetCommand.options,
        ...rest,
      };

      let canRun = true;

      for (const validationFunction of validationFunctions) {
        const stopValidationLoop = await validationFunction({ interaction, client, commandObj });

        if (stopValidationLoop) {
          canRun = false;
          break;
        }
      }

      if (canRun) {
        targetCommand.run({ interaction, client });
      }
    });
  }

  _areSlashCommandsDifferent(appCommand: any, localCommand: any) {
    if (!appCommand.options) appCommand.options = [];
    if (!localCommand.options) localCommand.options = [];

    if (!appCommand.description) appCommand.description = '';
    if (!localCommand.description) localCommand.description = '';

    if (
      localCommand.description !== appCommand.description ||
      localCommand.options.length !== appCommand.options.length
    ) {
      return true;
    }
  }

  getCommands() {
    return this._data.commands;
  }
}
