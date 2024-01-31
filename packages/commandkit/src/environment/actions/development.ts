import type yargs from 'yargs';
import { findConfigPath, importConfig } from '../common/config';
import colors from '../../utils/colors';
import { Logger } from '../common/logger';
import { loadEnv } from '../../bootstrap/loadEnv';
import { createClient, getClient } from '../../bootstrap/client';
import { bundle } from '../bundler/bundle';

const commandkitVersion = '[VI]{{inject}}[/VI]';

function printBanner() {
    const banner = colors.magenta(`${String.fromCharCode(9670)} CommandKit ${commandkitVersion}`);
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

    const envErr = loadEnv('development');

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
        Logger.Fatal(msg);
        return;
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

    // build the project
    const entrypoint = await bundle('development');

    try {
        // load the client entrypoint
        await import(`file://${entrypoint}`);
        await client.login(config.token);
    } catch (e) {
        Logger.Fatal('Failed to load the client entrypoint', e);
    }
}
