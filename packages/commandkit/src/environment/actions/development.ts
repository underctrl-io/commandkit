import type yargs from 'yargs';
import { findConfigPath, importConfig } from '../common/config';
import colors from '../../utils/colors';
import { Logger } from '../common/logger';
import { loadEnv } from '../../bootstrap/loadEnv';
import {
    DisposableCallbacksRegistry,
    createClient,
    getClient,
    getCommandKit,
    setupCommandKit,
} from '../../bootstrap/client';
import { bundle } from '../bundler/bundle';
import { EventEmitter } from 'node:events';
import { CKitActionType, CKitNotification } from './common';
import { CKitInternalEnvState } from '../env';

const commandkitVersion = '[VI]{{inject}}[/VI]';

export const notification = new EventEmitter();

function printBanner() {
  const banner = colors.magenta(
    `${String.fromCharCode(9670)} CommandKit ${commandkitVersion}`,
  );
  Logger.Log(banner);
  Logger.Info('Initializing the development environment...');
}

export async function initializeDevelopmentEnvironment(
  args: yargs.ArgumentsCamelCase<{
    config?: string | undefined;
    nodeOptions?: string | undefined;
  }>,
) {
  printBanner();

  if (getClient()) {
    Logger.Fatal('The development environment is already initialized.');
    return;
  }

    CKitInternalEnvState.$env__type = 'development';

    const envErr = loadEnv();

  if (envErr) {
    Logger.Warning('Failed to load .env', envErr);
  } else {
    Logger.Debug('Loaded .env');
  }

    const configPath = await findConfigPath(args.config ?? process.cwd());
    if (!configPath) {
        const msg = `Could not locate the commandkit config file${
            args.config ? ' at ' + args.config : ' in the current working directory'
        }.`;
        return Logger.Fatal(msg);
    }

  try {
    var config = await importConfig(configPath);
    Logger.Debug('Loaded config from', colors.yellow(configPath));
  } catch (e) {
    Logger.Warning('Failed to load config');
    Logger.Fatal(colors.red((e as Error).stack ?? `${e}`));
    return;
  }

    const client = createClient();
    setupCommandKit(client);

    notification.once(CKitNotification.ReloadAck, async () => {
        await client.login(config.token);
    });

    try {
        notification.emit(CKitNotification.Reload, CKitActionType.ReloadAll);
    } catch (e) {
        Logger.Fatal('Failed to load the client entrypoint', e);
    }
}

const ensureCommandKit = () => {
    const commandkit = getCommandKit();

    if (!commandkit) {
        return Logger.Fatal('CommandKit is not initialized.');
    }

    return commandkit;
};

notification.on(CKitNotification.Reload, async (action: CKitActionType) => {
    const entrypoint = await bundle();

    try {
        switch (action) {
            case CKitActionType.ReloadAll:
                // dispose before reloading to clean up any resources
                await Promise.all([...DisposableCallbacksRegistry.values()].map((cb) => cb()));
                await import(`file://${entrypoint}?t=${Date.now()}`);
                notification.emit(CKitNotification.ReloadAck);
                break;
            case CKitActionType.ReloadCommands:
                await ensureCommandKit().reloadCommands();
                break;
            case CKitActionType.ReloadEvents:
                await ensureCommandKit().reloadEvents();
                break;
            case CKitActionType.ReloadValidators:
                await ensureCommandKit().reloadValidations();
                break;
        }
    } catch (e) {
        Logger.Fatal('Failed to load the client entrypoint', e);
    }
});
