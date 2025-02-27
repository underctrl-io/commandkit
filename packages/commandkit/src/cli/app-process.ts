import { spawn } from 'node:child_process';
import { DevEnv, devEnvFileArgs, prodEnvFileArgs } from './env';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { panic } from './common';

export function createAppProcess(
  fileName: string,
  cwd: string,
  isDev: boolean,
) {
  const envFiles = isDev ? devEnvFileArgs(cwd) : prodEnvFileArgs(cwd);

  if (!existsSync(join(cwd, fileName))) {
    panic(`Could not locate the entrypoint file: ${fileName}`);
  }

  const ps = spawn(
    'node',
    [
      ...envFiles,
      `--title="CommandKit ${isDev ? 'Development' : 'Production'}"`,
      '--enable-source-maps',
      fileName,
    ],
    {
      cwd: cwd,
      windowsHide: true,
      env: DevEnv(),
      stdio: 'pipe',
    },
  );

  ps.stdout?.pipe(process.stdout);
  ps.stderr?.pipe(process.stderr);

  return ps;
}
