import { IOType, spawn } from 'node:child_process';
import { DevEnv, ProdEnv } from './env';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { panic } from './common';

/**
 * @private
 * @internal
 */
function getStdio(supportsCommands: boolean) {
  if (supportsCommands) {
    return ['pipe', 'pipe', 'pipe', 'ipc'];
  }

  return ['pipe', 'pipe', 'pipe'];
}

/**
 * @private
 * @internal
 */
export function createAppProcess(
  fileName: string,
  cwd: string,
  isDev: boolean,
) {
  if (!existsSync(join(cwd, fileName))) {
    panic(`Could not locate the entrypoint file: ${fileName}`);
  }

  const stdio = getStdio(isDev) as IOType[];

  const ps = spawn(
    'node',
    [
      `--title="CommandKit ${isDev ? 'Development' : 'Production'}"`,
      '--enable-source-maps',
      fileName,
    ],
    {
      cwd,
      windowsHide: true,
      env: isDev ? DevEnv() : ProdEnv(),
      stdio,
    },
  );

  ps.stdout?.pipe(process.stdout);
  ps.stderr?.pipe(process.stderr);

  return ps;
}
