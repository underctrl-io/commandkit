// @ts-check
import { config as dotenv } from 'dotenv';
import { join } from 'node:path';
import { build } from 'tsup';
import { Colors, erase, findCommandKitConfig, panic, write } from './common.mjs';
import { parseEnv } from './parse-env.mjs';
import child_process from 'node:child_process';
import ora from 'ora';
import { injectShims } from './build.mjs';

const RESTARTING_MSG_PATTERN = /^Restarting '|".+'|"\n?$/;
const FAILED_RUNNING_PATTERN = /^Failed running '.+'|"\n?$/;

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

    if (watchMode && !nodeOptions.includes('--watch')) {
        nodeOptions.push('--watch');
    } else if (!watchMode && nodeOptions.includes('--watch')) {
        nodeOptions.splice(nodeOptions.indexOf('--watch'), 1);
    }

    if (!nodeOptions.includes('--enable-source-maps')) {
        nodeOptions.push('--enable-source-maps');
    }

    erase('.commandkit');

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
                return await injectShims('.commandkit', main, false, requirePolyfill);
            },
        });

        status.succeed(
            Colors.green(`Dev server started in ${(performance.now() - start).toFixed(2)}ms!\n`),
        );

        if (watchMode) write(Colors.cyan('Watching for file changes...\n'));

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

        /**
         * @type {child_process.ChildProcessWithoutNullStreams}
         */
        const ps = child_process.spawn(
            'node',
            [...nodeOptions, join(process.cwd(), '.commandkit', main)],
            {
                env: {
                    ...process.env,
                    ...processEnv,
                    NODE_ENV: 'development',
                    // @ts-expect-error
                    COMMANDKIT_DEV: true,
                    // @ts-expect-error
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
    } catch (e) {
        status.fail(`Error occurred after ${(performance.now() - start).toFixed(2)}ms!\n`);
        panic(e.stack ?? e);
    }
}
