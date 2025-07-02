import { type IOType, execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'node:path';

import type { PackageManager } from '../types';
import { commands } from '../utils.js';

interface SetupProps {
  manager: PackageManager;
  token: string;
  dir: string;
  stdio?: IOType;
}

export async function setup({
  manager,
  token,
  dir,
  stdio = 'pipe',
}: SetupProps) {
  await fs.emptyDir(dir);

  if (manager === 'yarn') {
    execSync(commands.init.yarn, { cwd: dir, stdio });
  }

  if (manager === 'deno') {
    const denoJsonPath = path.join(dir, 'deno.json');
    const denoJson = {
      compilerOptions: {
        jsx: 'react-jsx',
        jsxImportSource: 'commandkit',
      },
      nodeModulesDir: 'auto',
      lock: true,
      lint: {
        include: ['src/'],
        exclude: ['node_modules/', 'dist/', '.commandkit/'],
      },
      fmt: {
        useTabs: false,
        lineWidth: 120,
        indentWidth: 2,
        semiColons: true,
        singleQuote: true,
        include: ['src/'],
        exclude: ['node_modules/', 'dist/', '.commandkit/'],
      },
    };

    await fs.writeJSON(denoJsonPath, denoJson, { spaces: 2, EOL: '\n' });
  }

  const packageJsonPath = path.join(dir, 'package.json');

  const packageJson = {
    name:
      dir.replaceAll('\\', '/').split('/').pop()?.toLowerCase() ||
      'commandkit-project',
    description: 'A CommandKit project',
    version: '0.1.0',
    type: 'module',
    private: true,
    main: 'dist/index.js',
    scripts: {
      dev: 'commandkit dev',
      build: 'commandkit build',
      start: 'commandkit start',
    },
    devDependencies: {},
    dependencies: {},
  };

  await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });

  await fs.writeFile(`${dir}/.env`, `DISCORD_TOKEN="${token || ''}"`);
}
