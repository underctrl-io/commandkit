import { erase, findCommandKitConfig, panic, write } from './common';
import colors from '../utils/colors';
import { createNodeProcess, createSpinner } from './utils';
import { bootstrapDevelopmentBuild } from './build';

const RESTARTING_MSG_PATTERN = /^Restarting '|".+'|"\n?$/;
const FAILED_RUNNING_PATTERN = /^Failed running '.+'|"\n?$/;

export async function bootstrapDevelopmentServer(opts: any) {
  const config = await findCommandKitConfig(opts.config);
  const { watch = true, nodeOptions = [], clearRestartLogs = true } = config;

  const spinner = await createSpinner('Starting development server...');
  const start = performance.now();

  try {
    await erase('.commandkit');
    await bootstrapDevelopmentBuild(opts.config);

    const ps = createNodeProcess({
      ...config,
      outDir: '.commandkit',
      nodeOptions: [
        ...nodeOptions,
        watch ? '--watch' : '',
        '--enable-source-maps',
      ].filter(Boolean),
      env: {
        NODE_ENV: 'development',
        COMMANDKIT_DEV: 'true',
        COMMANDKIT_PRODUCTION: 'false',
      },
    });

    let isLastLogRestarting = false,
      hasStarted = false;

    ps.stdout?.on('data', (data) => {
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

    ps.stderr?.on('data', (data) => {
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

    spinner.succeed(
      colors.green(
        `Dev server started in ${(performance.now() - start).toFixed(2)}ms!\n`,
      ),
    );
  } catch (e) {
    spinner.fail(colors.red(`Failed to start dev server: ${e}`));
    panic(e instanceof Error ? e.stack : e);
  }
}
