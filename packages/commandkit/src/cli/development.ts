// @ts-check
import { config as dotenv } from 'dotenv';
import { join } from 'node:path';
import { build } from 'tsup';
import {
  copyLocaleFiles,
  erase,
  findCommandKitConfig,
  panic,
  write,
} from './common';
import { parseEnv } from './parse-env';
import child_process from 'node:child_process';
import ora from 'ora';
import { injectShims } from './build';
import { commandkitPlugin } from './esbuild-plugins/plugin';
import colors from '../utils/colors';

const RESTARTING_MSG_PATTERN = /^Restarting '|".+'|"\n?$/;
const FAILED_RUNNING_PATTERN = /^Failed running '.+'|"\n?$/;

export async function bootstrapDevelopmentServer(opts: any) {
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
  const status = ora(
    colors.green('Starting a development server...\n'),
  ).start();
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
      cjsInterop: true,
      splitting: false,
      jsxFactory: 'CommandKit.createElement',
      jsxFragment: 'CommandKit.Fragment',
      async onSuccess() {
        await copyLocaleFiles(src, '.commandkit');
        return await injectShims('.commandkit', main, false, requirePolyfill);
      },
      esbuildPlugins: [
        commandkitPlugin({
          'use-macro': false,
        }),
      ],
    });

    status.succeed(
      colors.green(
        `Dev server started in ${(performance.now() - start).toFixed(2)}ms!\n`,
      ),
    );

    if (watchMode) write(colors.cyan('Watching for file changes...\n'));

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
        write(colors.cyan('Failed running the bot, waiting for changes...'));
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
        write(colors.cyan('⌀ Restarting the bot...'));
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

      write(colors.red(message));
    });

    ps.on('close', (code) => {
      write('\n');
      process.exit(code ?? 0);
    });

    ps.on('error', (err) => {
      panic(err);
    });
  } catch (e) {
    status.fail(
      `Error occurred after ${(performance.now() - start).toFixed(2)}ms!\n`,
    );
    panic(e instanceof Error ? e.stack : e);
  }
}
