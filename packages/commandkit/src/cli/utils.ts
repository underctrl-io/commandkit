import { config as dotenv } from 'dotenv';
import { join } from 'node:path';
import { parseEnv } from './parse-env';
import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import colors from '../utils/colors';
import { CLIOptions } from './types';
import type { Ora } from 'ora';

let ora: typeof import('ora') | undefined;

export function createNodeProcess(
  options: CLIOptions,
): ChildProcessWithoutNullStreams {
  const { nodeOptions = [], main, outDir, env = {} } = options;
  const processEnv = loadEnvFiles(options);

  return spawn(
    'node',
    [...nodeOptions, join(process.cwd(), outDir, main)].filter(Boolean),
    {
      env: {
        ...process.env,
        ...processEnv,
        ...env,
      },
      cwd: process.cwd(),
    },
  );
}

export function loadEnvFiles(options: CLIOptions) {
  const { envExtra = true } = options;
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

  return processEnv;
}

export async function createSpinner(text: string): Promise<Ora> {
  if (!ora) ora = await import('ora');

  return (ora.default || ora)({
    text,
    color: 'cyan',
  });
}

export function write(message: string): void {
  process.stdout.write(message + '\n');
}

export function panic(message: string): never {
  write(colors.red(`Error: ${message}`));
  process.exit(1);
}
