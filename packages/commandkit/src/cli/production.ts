// @ts-check
import { config as dotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { findCommandKitConfig, panic, write } from './common';
import { parseEnv } from './parse-env';
import child_process from 'node:child_process';
import colors from '../utils/colors';

export async function bootstrapProductionServer(config: any) {
  const {
    main,
    outDir = 'dist',
    envExtra = true,
    sourcemap,
  } = await findCommandKitConfig(config);

  if (!existsSync(join(process.cwd(), outDir, main))) {
    panic(
      'Could not find production build, maybe run `commandkit build` first?',
    );
  }

  try {
    const processEnv = {};

    const env = dotenv({
      path: join(process.cwd(), '.env'),
      processEnv,
    });

    if (envExtra) {
      parseEnv(processEnv);
    }

    if (env.error) {
      write(colors.yellow(`[DOTENV] Warning: ${env.error.message}`));
    }

    if (env.parsed) {
      write(colors.blue('[DOTENV] Loaded .env file!'));
    }

    const ps: child_process.ChildProcessWithoutNullStreams =
      child_process.spawn(
        'node',
        [
          sourcemap ? '--enable-source-maps' : '',
          join(process.cwd(), outDir, main),
        ].filter(Boolean),
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
      write(colors.red(data.toString()));
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
