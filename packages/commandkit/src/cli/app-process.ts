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

  const baseArgs = [
    `--title="CommandKit ${isDev ? 'Development' : 'Production'}"`,
    '--enable-source-maps',
  ];

  const nodeOptions = process.env.CK_NODE_OPTIONS || process.env.NODE_OPTIONS;
  let nodeArgs = [...baseArgs];

  if (nodeOptions) {
    const options = nodeOptions.trim().split(/\s+/);

    for (const option of options) {
      const optionName = option.split('=')[0];
      const existingIndex = nodeArgs.findIndex((arg) =>
        arg.startsWith(optionName),
      );

      if (existingIndex !== -1) {
        nodeArgs[existingIndex] = option;
      } else {
        nodeArgs.push(option);
      }
    }
  }

  nodeArgs.push(fileName);

  const ps = spawn('node', nodeArgs, {
    cwd,
    windowsHide: true,
    env: isDev ? DevEnv() : ProdEnv(),
    stdio,
  });

  ps.stdout?.pipe(process.stdout);
  ps.stderr?.pipe(process.stderr);

  return ps;
}
