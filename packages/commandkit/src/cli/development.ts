import { join } from 'path';
import { loadConfigFile } from '../config/loader';
import { isCompilerPlugin } from '../plugins';
import { createAppProcess } from './app-process';
import { buildApplication } from './build';
import { watch } from 'chokidar';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { readdirSync } from 'node:fs';
import { debounce } from '../utils/utilities';
import colors from '../utils/colors';

async function buildAndStart(configPath: string, skipStart = false) {
  const config = await loadConfigFile(configPath);
  const mainFile = join('.commandkit', 'index.js');

  await buildApplication({
    configPath,
    isDev: true,
    plugins: config.plugins.filter((p) => isCompilerPlugin(p)),
    esbuildPlugins: config.esbuildPlugins,
  });

  if (skipStart) return null as never;

  return createAppProcess(mainFile, configPath, true);
}

const isCommandSource = (p: string) =>
  p.replaceAll('\\', '/').includes('src/app/commands');

const isEventSource = (p: string) =>
  p.replaceAll('\\', '/').includes('src/app/events');

const isLocaleSource = (p: string) =>
  p.replaceAll('\\', '/').includes('src/app/locales');

export async function bootstrapDevelopmentServer(configPath?: string) {
  const start = performance.now();
  const cwd = configPath || process.cwd();

  const watcher = watch([join(cwd, 'src')], {
    ignoreInitial: true,
  });

  let ps: ChildProcessWithoutNullStreams | null = null;

  const performHMR = debounce(async (path?: string): Promise<boolean> => {
    if (!path || !ps) return false;

    if (isCommandSource(path)) {
      console.log(
        `${colors.cyanBright('Reloading command(s) at ')} ${colors.yellowBright(path)}`,
      );
      await buildAndStart(cwd, true);
      ps.stdin.write(`COMMANDKIT_EVENT=reload-commands|${path}\n`);
      return true;
    }

    if (isEventSource(path)) {
      console.log(
        `${colors.cyanBright('Reloading event(s) at ')} ${colors.yellowBright(path)}`,
      );
      await buildAndStart(cwd, true);
      ps.stdin.write(`COMMANDKIT_EVENT=reload-events|${path}\n`);
      return true;
    }

    if (isLocaleSource(path)) {
      console.log(
        `${colors.cyanBright('Reloading locale(s) at ')} ${colors.yellowBright(path)}`,
      );
      await buildAndStart(cwd, true);
      ps.stdin.write(`COMMANDKIT_EVENT=reload-locales|${path}\n`);
      return true;
    }

    return false;
  }, 300);

  const hmrHandler = async (path: string) => {
    if (await performHMR(path)) return;

    ps?.kill();

    ps = await buildAndStart(cwd);
  };

  process.stdin.on('data', async (d) => {
    const command = d.toString().trim();

    switch (command) {
      case 'r':
        console.log(`Received restart command, restarting...`);
        ps?.kill();
        ps = null;
        await buildAndStart(cwd);
        break;
      case 'rc':
        console.log(`Received reload commands command, reloading...`);
        ps?.stdin.write(`COMMANDKIT_EVENT=reload-commands\n`);
        break;
      case 're':
        console.log(`Received reload events command, reloading...`);
        ps?.stdin.write(`COMMANDKIT_EVENT=reload-events\n`);
        break;
      case 'rl':
        console.log(`Received reload locales command, reloading...`);
        ps?.stdin.write(`COMMANDKIT_EVENT=reload-locales\n`);
        break;
    }
  });

  watcher.on('change', hmrHandler);
  watcher.on('add', hmrHandler);
  watcher.on('unlink', hmrHandler);
  watcher.on('unlinkDir', (path) => {
    const hasChild = readdirSync(path).length > 0;
    if (hasChild) return hmrHandler(path);
  });
  watcher.on('error', (e) => {
    console.error(e);
  });

  ps = await buildAndStart(cwd);

  const end = performance.now();

  console.log(
    `${colors.greenBright('Development server started in')} ${colors.yellowBright(`${(end - start).toFixed(2)}ms`)}
${colors.greenBright('Watching for changes in')} ${colors.yellowBright('src')} ${colors.greenBright('directory')}

${colors.greenBright('Commands:')}
${colors.yellowBright('r')} - Restart the server
${colors.yellowBright('rc')} - Reload all commands
${colors.yellowBright('re')} - Reload all events
${colors.yellowBright('rl')} - Reload all locales`,
  );
}
