import type {
  Guild,
  Client,
  ApplicationCommandData,
  GuildApplicationCommandManager,
  ApplicationCommandDataResolvable,
} from 'discord.js';
import type { CommandFileObject, ReloadOptions } from '../../../../types';

import areSlashCommandsDifferent from '../utils/areSlashCommandsDifferent';

import colors from '../../../../utils/colors';
import { Logger } from '../../../../logger/Logger';
import { COMMANDKIT_IS_TEST } from '../../../../utils/constants';

type RegisterCommandProps = {
  client: Client;
  commands: CommandFileObject[];
  devGuildIds: string[];
  reloading?: boolean;
  type?: ReloadOptions;
};

/**
 * Register client commands to Discord.
 * @param props
 */
export default async function registerCommands(props: RegisterCommandProps) {
  if (COMMANDKIT_IS_TEST) return;

  if (props.reloading) {
    if (props.client.isReady()) {
      await handleRegistration(
        props.client,
        props.commands,
        props.devGuildIds,
        props.type,
      );
    } else {
      throw new Error(
        colors.red(`Cannot reload commands when client is not ready.`),
      );
    }
  } else {
    props.client.once('ready', async (c) => {
      await handleRegistration(
        c,
        props.commands,
        props.devGuildIds,
        props.type,
      );
    });
  }
}

async function handleRegistration(
  client: Client<true>,
  commands: CommandFileObject[],
  devGuildIds: string[],
  type?: ReloadOptions,
) {
  const devOnlyCommands = commands.filter(
    (cmd) => cmd.options?.devOnly || cmd.data?.guilds?.length,
  );
  const globalCommands = commands.filter(
    (cmd) => !cmd.options?.devOnly && !cmd.data?.guilds?.length,
  );

  if (type === 'dev') {
    await registerGuildCommands(client, devOnlyCommands, devGuildIds);
  } else if (type === 'global') {
    await registerGlobalCommands(client, globalCommands);
  } else {
    await registerGuildCommands(client, devOnlyCommands, devGuildIds);
    await registerGlobalCommands(client, globalCommands);
  }
}

async function registerGlobalCommands(
  client: Client<true>,
  commands: CommandFileObject[],
) {
  const appCommandsManager = client.application.commands;
  await appCommandsManager.fetch();

  for (const command of commands) {
    const targetCommand = appCommandsManager.cache.find(
      (cmd) => cmd.name === command.data.name,
    );

    // <!-- Delete global command -->
    if (command.options?.deleted) {
      if (!targetCommand) {
        process.emitWarning(
          colors.yellow(
            `Ignoring: Command "${command.data.name}" is globally marked as deleted.`,
          ),
        );
      } else {
        await targetCommand.delete().catch((error) => {
          throw new Error(
            colors.red(
              `Failed to delete command "${command.data.name}" globally.\n`,
            ),
            error,
          );
        });

        Logger.log(
          colors.green(`Deleted command "${command.data.name}" globally.`),
        );
      }

      continue;
    }

    // <!-- Edit global command -->
    if (targetCommand) {
      const commandsAreDifferent = areSlashCommandsDifferent(
        targetCommand,
        command.data,
      );

      if (commandsAreDifferent) {
        await targetCommand
          .edit(command.data as Partial<ApplicationCommandData>)
          .catch((error) => {
            throw new Error(
              colors.red(
                `Failed to edit command "${command.data.name}" globally.\n`,
              ),
              error,
            );
          });

        Logger.log(
          colors.green(`Edited command "${command.data.name}" globally.`),
        );

        continue;
      }
    }

    // <!-- Register global command -->
    if (targetCommand) continue;

    await appCommandsManager
      .create(command.data as ApplicationCommandDataResolvable)
      .catch((error) => {
        throw new Error(
          colors.red(
            `Failed to register command "${command.data.name}" globally.\n`,
          ),
          error,
        );
      });

    Logger.log(
      colors.green(`Registered command "${command.data.name}" globally.`),
    );
  }
}

async function registerDevCommands(
  client: Client<true>,
  commands: CommandFileObject[],
  guildIds: string[],
) {
  const devGuilds: Guild[] = [];

  for (const guildId of guildIds) {
    const guild =
      client.guilds.cache.get(guildId) || (await client.guilds.fetch(guildId));

    if (!guild) {
      process.emitWarning(
        colors.yellow(
          `Ignoring: Guild ${guildId} doesn't exist or client isn't part of the guild.`,
        ),
      );
      continue;
    }

    devGuilds.push(guild);
  }

  const guildCommandsManagers: GuildApplicationCommandManager[] = [];

  for (const guild of devGuilds) {
    const guildCommandsManager = guild.commands;
    await guildCommandsManager.fetch();

    guildCommandsManagers.push(guildCommandsManager);
  }

  for (const command of commands) {
    for (const guildCommands of guildCommandsManagers) {
      const targetCommand = guildCommands.cache.find(
        (cmd) => cmd.name === command.data.name,
      );

      // <!-- Delete dev command -->
      if (command.options?.deleted) {
        if (!targetCommand) {
          process.emitWarning(
            colors.yellow(
              `Ignoring: Command "${command.data.name}" is marked as deleted in ${guildCommands.guild.name}.`,
            ),
          );
        } else {
          await targetCommand.delete().catch((error) => {
            throw new Error(
              colors.red(
                `Failed to delete command "${command.data.name}" in ${guildCommands.guild.name}.`,
              ),
              error,
            );
          });

          Logger.log(
            colors.green(
              `Deleted command "${command.data.name}" in ${guildCommands.guild.name}.`,
            ),
          );
        }

        continue;
      }

      // <!-- Edit dev command -->
      if (targetCommand) {
        const commandsAreDifferent = areSlashCommandsDifferent(
          targetCommand,
          command.data,
        );

        if (commandsAreDifferent) {
          await targetCommand
            .edit(command.data as Partial<ApplicationCommandData>)
            .catch((error) => {
              throw new Error(
                colors.red(
                  `Failed to edit command "${command.data.name}" in ${guildCommands.guild.name}.\n`,
                ),
                error,
              );
            });

          Logger.log(
            colors.green(
              `Edited command "${command.data.name}" in ${guildCommands.guild.name}.`,
            ),
          );

          continue;
        }
      }

      // <!-- Register guild command -->
      if (targetCommand) continue;

      delete command.data.guilds;
      const commandData = command.data as ApplicationCommandDataResolvable;

      await guildCommands.create(commandData).catch((error) => {
        throw new Error(
          colors.red(
            `Failed to register command "${command.data.name}" in ${guildCommands.guild.name}.\n`,
          ),
          error,
        );
      });

      Logger.log(
        colors.green(
          `Registered command "${command.data.name}" in ${guildCommands.guild.name}.`,
        ),
      );
    }
  }
}

async function registerGuildCommands(
  client: Client<true>,
  commands: CommandFileObject[],
  devGuildIds: string[],
) {
  const guildCommands = commands.filter((c) => c.data.guilds?.length);
  const notGuildCommands = commands.filter((c) => c.options?.devOnly);

  await registerDevCommands(client, notGuildCommands, devGuildIds);
  await registerDevCommands(
    client,
    guildCommands,
    guildCommands.flatMap((c) => c.data.guilds).filter((c) => c !== undefined),
  );
}
