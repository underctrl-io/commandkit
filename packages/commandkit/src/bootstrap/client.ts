import { Client } from 'discord.js';
import { watch } from 'chokidar';
import { CommandKitConfig, getConfig } from '../config';
import { CommandKit, Environment } from '..';
import { notification } from '../environment/actions/development';
import { CKitActionType, CKitNotification } from '../environment/actions/common';
import { join } from 'path';

let discord_client: Client, commandkit: CommandKit;

export const DisposableCallbacksRegistry = new Set<DisposableCallback>();

type DisposableCallback = () => Awaited<void>;

/**
 * Registers a callback that will be executed when the the process is about restart. This is useful for cleaning up resources.
 * This will only be executed in development mode.
 */
export function disposable(callback: DisposableCallback) {
    const cb = async () => {
        try {
            await callback();
        } finally {
            DisposableCallbacksRegistry.delete(cb);
        }
    };

    DisposableCallbacksRegistry.add(cb);
}

/**
 * @internal
 */
export function getClient() {
    return discord_client;
}

/**
 * @internal
 */
export function getCommandKit() {
    return commandkit;
}

export function registerClient(client: Client) {
    if (discord_client) return;
    if (Environment.isDevelopment()) {
        throw new Error('Cannot register client in development mode.');
    }

    discord_client = client;
}

/**
 * Fetches the client instance. If the client instance is not initialized, an error will be thrown.
 */
export function client<T extends boolean = boolean>() {
    if (!discord_client) {
        throw new Error(
            'Client was not initialized. Make sure to run "commandkit dev" to bootstrap the client.',
        );
    }

    return discord_client as Client<T>;
}

export function createClient() {
    const config = getConfig();

    discord_client = new Client(config.clientOptions);

    return discord_client;
}

export function setupCommandKit(client: Client) {
    const config = getConfig();

    const getPath = (to: string) => join(process.cwd(), '.commandkit', to);

    commandkit = new CommandKit({
        ...config.commandHandler,
        commandsPath: getPath('commands'),
        eventsPath: getPath('events'),
        validationsPath: getPath('validations'),
        client,
    });

    registerWatcher(commandkit, config);

    return commandkit;
}

function registerWatcher(commandkit: CommandKit, config: CommandKitConfig) {
    if (!config.watch) return;

    // handles changes made to commands
    _initCommandsWatcher(commandkit);
    // handles changes made to events
    _initEventsWatcher(commandkit);
    // handles changes made to validations
    _initValidationsWatcher(commandkit);
}

const _ignorable = (str: string) => /^_/.test(str) || /\.(map|d\.ts)$/.test(str);

function _initEventsWatcher(commandkit: CommandKit) {
    if (!commandkit.eventsPath) return;

    const watcher = watch(commandkit.eventsPath, {
        ignoreInitial: true,
        ignored: (testString) => _ignorable(testString),
    });

    watcher.on('all', async (event) => {
        if (event === 'change') {
            notification.emit(CKitNotification.Reload, CKitActionType.ReloadEvents);
        }
    });
}

function _initValidationsWatcher(commandkit: CommandKit) {
    if (!commandkit.validationsPath) return;

    const watcher = watch(commandkit.validationsPath, {
        ignoreInitial: true,
        ignored: (testString) => _ignorable(testString),
    });

    watcher.on('all', async (event) => {
        if (event === 'change') {
            notification.emit(CKitNotification.Reload, CKitActionType.ReloadValidators);
        }
    });
}

function _initCommandsWatcher(commandkit: CommandKit) {
    if (!commandkit.commandsPath) return;

    const watcher = watch(commandkit.commandsPath, {
        ignoreInitial: true,
        ignored: (testString) => _ignorable(testString),
    });

    watcher.on('all', async (event) => {
        if (event === 'change') {
            notification.emit(CKitNotification.Reload, CKitActionType.ReloadCommands);
        }
    });
}
