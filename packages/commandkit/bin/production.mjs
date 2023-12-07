// @ts-check
import { config as dotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Colors, findCommandKitConfig, panic, write } from './common.mjs';
import { parseEnv } from './parse-env.mjs';
import child_process from 'node:child_process';

export async function bootstrapProductionServer(config) {
    const {
        main,
        outDir = 'dist',
        envExtra = true,
        sourcemap,
    } = await findCommandKitConfig(config);

    if (!existsSync(join(process.cwd(), outDir, main))) {
        panic('Could not find production build, maybe run `commandkit build` first?');
    }

    try {
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
            [sourcemap ? '--enable-source-maps' : '', join(process.cwd(), outDir, main)].filter(
                Boolean,
            ),
            {
                env: {
                    ...process.env,
                    ...processEnv,
                    NODE_ENV: 'production',
                    // @ts-expect-error
                    COMMANDKIT_DEV: false,
                    //  @ts-expect-error
                    COMMANDKIT_PROD: true,
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
        panic(e);
    }
}
