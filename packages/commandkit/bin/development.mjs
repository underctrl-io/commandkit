// @ts-check
import { config as dotenv } from 'dotenv';
import { join } from 'node:path';
import { build } from 'tsup';
import { Colors, erase, findCommandKitConfig, panic, write } from './common.mjs';
import { parseEnv } from './parse-env.mjs';
import child_process from 'node:child_process';
import ora from 'ora';
import { injectShims } from './build.mjs';
import { CommandKit, CommandKitSignalType } from '../dist';
import { watchFiles } from './watcher.mjs';

const RESTARTING_MSG_PATTERN = /^Restarting '|".+'|"\n?$/;
const FAILED_RUNNING_PATTERN = /^Failed running '.+'|"\n?$/;

function readEnv(envExtra) {
    const processEnv = {};
    const env = dotenv({
        path: join(process.cwd(), '.env'),
        // @ts-expect-error
        processEnv,
    });

    if (envExtra) {
        parseEnv(processEnv);
    }

    if (env.error) {
        write(Colors.yellow(`[DOTENV] Warning: ${env.error.message}`));
    }

    if (env.parsed) {
        write(Colors.blue('[DOTENV] Loaded .env file!'));
    }

    return processEnv;
}

export async function bootstrapDevelopmentServer(opts) {
    const {
        src,
        main,
        watch = Boolean(opts.noWatch),
        nodeOptions = [],
        envExtra = true,
        clearRestartLogs = true,
        outDir,
        requirePolyfill,
    } = await findCommandKitConfig(opts.config);

    if (!src) {
        panic('Could not find src in commandkit.json');
    }

    if (!main) {
        panic('Could not find main in commandkit.json');
    }

    const watchMode = watch;
    const status = ora(Colors.green('Starting a development server...\n')).start();
    const start = performance.now();

    // if (watchMode && !nodeOptions.includes('--watch')) {
    //     nodeOptions.push('--watch');
    // } else if (!watchMode && nodeOptions.includes('--watch')) {
    //     nodeOptions.splice(nodeOptions.indexOf('--watch'), 1);
    // }

    if (!nodeOptions.includes('--enable-source-maps')) {
        nodeOptions.push('--enable-source-maps');
    }

    erase('.commandkit');

    let watchEmitted = false, serverProcess = null, watching = false;
    const watchModeMetadata = {
        didEventsChange: false,
        didCommandsChange: false,
        didValidatorsChange: false,
        didOthersChange: false,
    };

    const knownPaths = {
        commands: '',
        events: '',
        validators: '',
        source: join(process.cwd(), src),
        config: await findCommandKitConfig(opts.config, true)
    };

    try {
        await build({
            clean: true,
            format: ['esm'],
            dts: false,
            skipNodeModulesBundle: true,
            minify: false,
            shims: true,
            sourcemap: 'inline',
            keepNames: true,
            outDir: '.commandkit',
            silent: true,
            entry: [src, '!dist', '!.commandkit', `!${outDir}`].filter(Boolean),
            watch: watchMode,
            async onSuccess() {
                await injectShims('.commandkit', main, false, requirePolyfill);
                status.succeed(
                    Colors.green(`Dev server started in ${(performance.now() - start).toFixed(2)}ms!\n`),
                );
                const processEnv = readEnv(envExtra);
                if (watchMode) {
                    if (!watchEmitted) { write(Colors.cyan('Watching for file changes...\n')); watchEmitted = true }
                    if (!watching) {
                        watchFiles(Object.values(knownPaths).filter(Boolean), (path) => {
                            watchModeMetadata.didCommandsChange = path === knownPaths.commands;
                            watchModeMetadata.didEventsChange = path === knownPaths.events;
                            watchModeMetadata.didValidatorsChange = path === knownPaths.validators;

                            watchModeMetadata.didOthersChange = [
                                watchModeMetadata.didCommandsChange,
                                watchModeMetadata.didEventsChange,
                                watchModeMetadata.didValidatorsChange,
                            ].every(p => !p);
                        });
                        watching = true;
                    }
                }

                serverProcess = triggerRestart({
                    serverProcess,
                    processEnv,
                    main,
                    nodeOptions,
                    clearRestartLogs,
                    ...watchModeMetadata,
                });
            }
        });
    } catch (e) {
        status.fail(`Error occurred after ${(performance.now() - start).toFixed(2)}ms!\n`);
        panic(e.stack ?? e);
    }
}

async function triggerRestart({
    serverProcess,
    processEnv,
    main,
    nodeOptions,
    clearRestartLogs,
    didEventsChange,
    didCommandsChange,
    didValidatorsChange,
    didOthersChange
}) {
    if (didOthersChange && serverProcess) {
        serverProcess.kill();
    } else if (!didOthersChange && serverProcess) {
        /**
         * @type {import('node:child_process').ChildProcessWithoutNullStreams}
         */
        const commandkit = serverProcess;
        if (didEventsChange) {
            commandkit.send(CommandKitSignalType.ReloadEvents);
            write(Colors.cyan('⌀ Reloading events...'));
        }

        if (didCommandsChange) {
            commandkit.send(CommandKitSignalType.ReloadCommands);
            write(Colors.cyan('⌀ Reloading commands...'));
        }

        if (didValidatorsChange) {
            commandkit.send(CommandKitSignalType.ReloadValidations);
            write(Colors.cyan('⌀ Reloading validators...'));
        }

        return serverProcess;
    }

    return bootstrapNodeServer({
        main,
        nodeOptions,
        processEnv,
        clearRestartLogs,
    });
}

function bootstrapNodeServer({
    main,
    nodeOptions,
    processEnv,
    clearRestartLogs,
}) {
    /**
     * @type {child_process.ChildProcessWithoutNullStreams}
     */
    const ps = child_process.spawn(
        'node',
        [...nodeOptions.filter(o => o !== '--watch'), join(process.cwd(), '.commandkit', main)],
        {
            env: {
                ...process.env,
                ...processEnv,
                NODE_ENV: 'development',
                COMMANDKIT_DEV: true,
                COMMANDKIT_PRODUCTION: false,
            },
            cwd: process.cwd(),
        },
    );

    let isLastLogRestarting = false,
        hasStarted = false;

    ps.stdout.on('data', (data) => {
        const message = data.toString();

        if (FAILED_RUNNING_PATTERN.test(message)) {
            write(Colors.cyan('Failed running the bot, waiting for changes...'));
            isLastLogRestarting = false;
            if (!hasStarted) hasStarted = true;
            return;
        }

        if (clearRestartLogs && !RESTARTING_MSG_PATTERN.test(message)) {
            write(message);
            isLastLogRestarting = false;
        } else {
            if (isLastLogRestarting || !hasStarted) {
                if (!hasStarted) hasStarted = true;
                return;
            }
            write(Colors.cyan('⌀ Restarting the bot...'));
            isLastLogRestarting = true;
        }

        if (!hasStarted) hasStarted = true;
    });

    ps.stderr.on('data', (data) => {
        const message = data.toString();

        if (
            message.includes(
                'ExperimentalWarning: Watch mode is an experimental feature and might change at any time',
            )
        )
            return;

        write(Colors.red(message));
    });

    ps.on('close', (code) => {
        write('\n');
        process.exit(code ?? 0);
    });

    ps.on('error', (err) => {
        panic(err);
    });

    return ps;
}