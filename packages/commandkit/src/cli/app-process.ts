import { IOType, spawn } from 'node:child_process';
import { DevEnv } from './env';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { panic } from './common';

function getStdio(supportsCommands: boolean) {
  if (supportsCommands) {
    return ['pipe', 'pipe', 'pipe', 'ipc'];
  }

  return ['pipe', 'pipe', 'pipe'];
}

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
      env: DevEnv(),
      stdio,
    },
  );

  ps.stdout?.pipe(process.stdout);
  ps.stderr?.pipe(process.stderr);

  return ps;
}
