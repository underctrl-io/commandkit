import { join } from 'path';
import { loadConfigFile } from '../config/loader';
import { isCompilerPlugin } from '../plugins';
import { createAppProcess } from './app-process';
import { buildApplication } from './build';
import { watch } from 'chokidar';
import { debounce } from '../utils/utilities';
import colors from '../utils/colors';
import { ChildProcess } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

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

  const ps = createAppProcess(mainFile, configPath, true);

  ps.on('message', (message) => {
    console.log(`Received message from child process: ${message}`);
  });

  return ps;
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

  let ps: ChildProcess | null = null;

  const performHMR = debounce(async (path?: string): Promise<boolean> => {
    if (!path || !ps) return false;
    if (!ps.send) return false;

    if (isCommandSource(path)) {
      console.log(
        `${colors.cyanBright('Reloading command(s) at ')} ${colors.yellowBright(path)}`,
      );
      await buildAndStart(cwd, true);
      ps.send({ event: 'reload-commands', path });
      return true;
    }

    if (isEventSource(path)) {
      console.log(
        `${colors.cyanBright('Reloading event(s) at ')} ${colors.yellowBright(path)}`,
      );
      await buildAndStart(cwd, true);
      ps.send({ event: 'reload-events', path });
      return true;
    }

    if (isLocaleSource(path)) {
      console.log(
        `${colors.cyanBright('Reloading locale(s) at ')} ${colors.yellowBright(path)}`,
      );
      await buildAndStart(cwd, true);
      ps.send({ event: 'reload-locales', path });
      return true;
    }

    return false;
  }, 300);

  const hmrHandler = async (path: string) => {
    const hmr = await performHMR(path);
    if (hmr) return;

    console.log(
      `${colors.yellowBright('⚡️ Performing full restart due to the changes in')} ${colors.cyanBright(path)}`,
    );

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
        ps?.send({ event: 'reload-commands' });
        break;
      case 're':
        console.log(`Received reload events command, reloading...`);
        ps?.send({ event: 'reload-events' });
        break;
      case 'rl':
        console.log(`Received reload locales command, reloading...`);
        ps?.send({ event: 'reload-locales' });
        break;
    }
  });

  watcher.on('change', hmrHandler);
  watcher.on('add', hmrHandler);
  watcher.on('unlink', hmrHandler);
  watcher.on('unlinkDir', hmrHandler);
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
