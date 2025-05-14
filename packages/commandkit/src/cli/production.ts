import { join } from 'path';
import { loadConfigFile } from '../config/loader';
import { createAppProcess } from './app-process';
import { existsSync } from 'fs';
import { findEntrypoint, panic } from './common';
import { buildApplication } from './build';
import { CompilerPlugin, isCompilerPlugin } from '../plugins';
import { createSpinner } from './utils';

export async function bootstrapProductionServer(configPath?: string) {
  process.env.COMMANDKIT_BOOTSTRAP_MODE = 'production';
  const cwd = configPath || process.cwd();
  const config = await loadConfigFile(cwd);
  const mainFile = findEntrypoint(config.distDir);

  if (!existsSync(mainFile)) {
    panic(
      `Could not locate the entrypoint. Did you forget to build the application? Run 'commandkit build' to build the application first.`,
    );
  }

  return createAppProcess(mainFile, cwd, false);
}

export async function createProductionBuild(configPath?: string) {
  process.env.COMMANDKIT_BOOTSTRAP_MODE = 'production';
  const cwd = configPath || process.cwd();
  const config = await loadConfigFile(cwd);

  const spinner = await createSpinner(
    'Creating an optimized production build\n',
  );

  spinner.start();

  await buildApplication({
    configPath: cwd,
    isDev: false,
    plugins: config.plugins.filter((p) =>
      isCompilerPlugin(p),
    ) as CompilerPlugin[],
    esbuildPlugins: config.esbuildPlugins,
  });

  spinner.succeed('Production build completed!');
}
