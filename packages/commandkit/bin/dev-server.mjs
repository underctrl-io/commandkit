// @ts-check
import { config as dotenv } from 'dotenv';
import { build } from 'tsup';
import child_process from 'node:child_process';
import ora from 'ora';
import { join } from 'node:path';
import { Colors, erase, findCommandKitJSON, panic, write } from './common.mjs';

export async function bootstrapDevelopmentServer(config) {
    const { src, main = 'index.mjs', nodeOptions = ['--watch'] } = findCommandKitJSON(config);

    if (!src) {
        panic('Could not find src in commandkit.json');
    }

    const status = ora(Colors.green('Starting a development server...\n')).start();
    const start = performance.now();

    erase('.commandkit');

    try {
        await build({
            clean: true,
            format: ['esm'],
            dts: false,
            skipNodeModulesBundle: true,
            minify: false,
            shims: true,
            sourcemap: false,
            keepNames: true,
            outDir: '.commandkit',
            silent: true,
            entry: [src, '!dist', '!.commandkit'],
            watch: nodeOptions.includes('--watch'),
        });

        status.succeed(
            Colors.green(`Server started in ${(performance.now() - start).toFixed(2)}ms!\n`),
        );

        const processEnv = {};

        const env = dotenv({
            path: join(process.cwd(), '.env'),
            // @ts-expect-error
            processEnv,
        });

        if (env.error) {
            write(Colors.yellow(`[DOTENV] Warning: ${env.error.message}`));
        }

        if (env.parsed) {
            write(Colors.blue('[DOTENV] Loaded .env file!'));
        }

        const ps = child_process.spawn(
            'node',
            [...nodeOptions, join(process.cwd(), '.commandkit', main)],
            {
                env: {
                    ...process.env,
                    ...processEnv,
                    NODE_ENV: 'development',
                    COMMANDKIT_DEV: 'true',
                },
                cwd: process.cwd(),
            },
        );

        ps.stdout.on('data', (data) => {
            write(data.toString());
        });

        ps.stderr.on('data', (data) => {
            write(Colors.red(data.toString()));
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
        panic(e);
    }
}
