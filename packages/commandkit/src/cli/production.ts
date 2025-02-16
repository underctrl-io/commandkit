// @ts-check
import { config as dotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { findCommandKitConfig, panic, write } from './common';
import { parseEnv } from './parse-env';
import { createNodeProcess, createSpinner } from './utils';
import colors from '../utils/colors';

export async function bootstrapProductionServer(configPath: string) {
  const config = await findCommandKitConfig(configPath);
  const { outDir = 'dist', sourcemap } = config;

  if (!existsSync(join(process.cwd(), outDir))) {
    panic('Could not find production build, run `commandkit build` first');
  }

  const spinner = createSpinner('Starting production server...');

  try {
    const processEnv = {};

    const env = dotenv({
      path: join(process.cwd(), '.env'),
      processEnv,
    });

    parseEnv(processEnv);

    if (env.error) {
      write(colors.yellow(`[DOTENV] Warning: ${env.error.message}`));
    }

    if (env.parsed) {
      write(colors.blue('[DOTENV] Loaded .env file!'));
    }

    const ps = createNodeProcess({
      ...config,
      nodeOptions: [sourcemap ? '--enable-source-maps' : ''].filter(Boolean),
      env: {
        ...process.env,
        ...processEnv,
        NODE_ENV: 'production',
        COMMANDKIT_DEV: 'false',
        COMMANDKIT_PROD: 'true',
      },
    });

    ps.stdout?.on('data', (data) => {
      write(data.toString());
    });

    ps.stderr?.on('data', (data) => {
      write(colors.red(data.toString()));
    });

    ps.on('close', (code) => {
      write('\n');
      process.exit(code ?? 0);
    });

    ps.on('error', (err) => {
      panic(err);
    });

    spinner.succeed('Production server started successfully!');
  } catch (e) {
    spinner.fail('Failed to start production server');
    panic(e instanceof Error ? e.stack : e);
  }
}
