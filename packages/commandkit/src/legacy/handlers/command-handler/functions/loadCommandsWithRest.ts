import type { ApplicationCommandDataResolvable, Client } from 'discord.js';
import type { CommandFileObject, ReloadOptions } from '../../../../types';

import colors from '../../../../utils/colors';
import { Logger } from '../../../../logger/Logger';

type LoadCommandsWithRestProps = {
  /**
   * The main client.
   */
  client: Client;

  /**
   * An array of command objects.
   */
  commands: CommandFileObject[];

  /**
   * An array of developer guild IDs.
   */
  devGuildIds: string[];

  /**
   * A boolean indicating whether these commands are reloading.
   */
  reloading?: boolean;

  /**
   * A type for reloading the commands (if this is reloading).
   */
  type?: ReloadOptions;
};

/**
 * Use REST to load commands.
 * @param props - Options for loading commands.
 */
export default async function loadCommandsWithRest(
  props: LoadCommandsWithRestProps,
) {
  if (props.reloading) {
    if (props.client.isReady()) {
      await handleLoading(
        props.client,
        props.commands,
        props.devGuildIds,
        props.reloading,
        props.type,
      );
    } else {
      throw new Error(
        colors.red(`Cannot reload commands when client is not ready.`),
      );
    }
  } else {
    props.client.once('ready', async (c) => {
      await handleLoading(
        c,
        props.commands,
        props.devGuildIds,
        props.reloading,
        props.type,
      );
    });
  }
}

/**
 * Handles loading commands.
 * @param client - The discord.js client instance.
 * @param commands - An array of command file objects.
 * @param devGuildIds - An array of developer guild IDs.
 * @param reloading - A boolean indicating whether this is reloading.
 * @param type - A type for reloading the commands (if this is reloading).
 */
async function handleLoading(
  client: Client<true>,
  commands: CommandFileObject[],
  devGuildIds: string[],
  reloading?: boolean,
  type?: ReloadOptions,
) {
  commands = commands.filter((cmd) => !cmd.options?.deleted);
  const devOnlyCommands = commands.filter((cmd) => cmd.options?.devOnly);
  const globalCommands = commands.filter((cmd) => !cmd.options?.devOnly);

  if (type === 'dev') {
    await loadDevCommands(client, devOnlyCommands, devGuildIds, reloading);
  } else if (type === 'global') {
    await loadGlobalCommands(client, globalCommands, reloading);
  } else {
    await loadDevCommands(client, devOnlyCommands, devGuildIds, reloading);
    await loadGlobalCommands(client, globalCommands, reloading);
  }
}

/**
 * Load commands globally.
 * @param client - The discord.js client instance.
 * @param commands - An array of command file objects.
 * @param reloading - A boolean indicating whether the commands are reloading.
 */
async function loadGlobalCommands(
  client: Client<true>,
  commands: CommandFileObject[],
  reloading?: boolean,
) {
  const requestBody = commands.map((cmd) => cmd.data);

  await client.application.commands
    .set(requestBody as ApplicationCommandDataResolvable[])
    .catch((error) => {
      throw new Error(
        colors.red(
          `Error ${
            reloading ? 'reloading' : 'loading'
          } global application commands.\n`,
        ),
        error,
      );
    });

  Logger.log(
    colors.green(
      `${reloading ? 'Reloaded' : 'Loaded'} ${
        requestBody.length
      } global commands.`,
    ),
  );
}

/**
 * Load commands for dev guilds.
 * @param client - The discord.js client instance.
 * @param commands - An array of command file objects.
 * @param guildIds - An array of developer guild IDs.
 * @param reloading - A boolean indicating whether the commands are reloading.
 */
async function loadDevCommands(
  client: Client<true>,
  commands: CommandFileObject[],
  guildIds: string[],
  reloading?: boolean,
) {
  const requestBody = commands.map((cmd) => cmd.data);

  for (const guildId of guildIds) {
    const targetGuild =
      client.guilds.cache.get(guildId) || (await client.guilds.fetch(guildId));

    if (!targetGuild) {
      process.emitWarning(
        `Cannot ${
          reloading ? 'reload' : 'load'
        } commands in guild "${guildId}" - guild doesn't exist or client isn't part of the guild.`,
      );

      continue;
    }

    await targetGuild.commands
      .set(requestBody as ApplicationCommandDataResolvable[])
      .catch((error) => {
        throw new Error(
          colors.red(
            `Error ${
              reloading ? 'reloading' : 'loading'
            } developer application commands in guild "${
              targetGuild?.name || guildId
            }".\n`,
          ),
          error,
        );
      });

    Logger.log(
      colors.green(
        `${reloading ? 'Reloaded' : 'Loaded'} ${
          requestBody.length
        } developer commands in guild "${targetGuild.name}".`,
      ),
    );
  }
}
